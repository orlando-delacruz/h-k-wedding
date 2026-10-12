/**
 * Browser end-to-end tests for the RSVP journey. Runs headless Chrome against the
 * dev stack and fails loudly on any page crash, which is exactly what a missing
 * data field used to cause.
 *
 * Run: npm run test:ui      (requires: npm run dev in another terminal)
 */
import { chromium } from 'playwright-core'

const BASE = process.env.URL || 'http://localhost:5173'
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail && !ok ? `  — ${detail}` : ''}`)
}

async function openPage(context) {
  const page = await context.newPage()
  const crashes = []
  page.on('pageerror', (e) => crashes.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error' && !/maps|google/i.test(m.text())) crashes.push(m.text())
  })
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(600)
  await page.click('.seal').catch(() => {})
  await page.waitForTimeout(1500)
  return { page, crashes }
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true })

try {
  /* ------------------------------- accept flow ------------------------------- */
  const acceptedCtx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const accepted = await openPage(acceptedCtx)
  const stamp = Date.now()

  await accepted.page.locator('#rsvp').scrollIntoViewIfNeeded()
  await accepted.page.locator('#rsvp input[placeholder="Enter your name..."]').fill(`UI Accept ${stamp}`)
  await accepted.page.locator('#rsvp button:has-text("YES I\'M GOING TO ATTEND")').click()
  await accepted.page.waitForTimeout(500)

  check('attend button opens the guests step', await accepted.page.locator('#rsvp textarea[placeholder="Express your heartfelt message here..."]').isVisible())

  // The spec requires the name to survive a Back trip.
  await accepted.page.locator('#rsvp button:has-text("Back")').click()
  await accepted.page.waitForTimeout(400)
  const preserved = await accepted.page.locator('#rsvp input[placeholder="Enter your name..."]').inputValue()
  check('the name survives a Back trip', preserved === `UI Accept ${stamp}`, preserved)
  await accepted.page.locator('#rsvp button:has-text("YES I\'M GOING TO ATTEND")').click()
  await accepted.page.waitForTimeout(400)

  await accepted.page.locator('#rsvp input[placeholder="full name"]').first().fill('Companion One')
  await accepted.page.locator('#rsvp textarea[placeholder="Express your heartfelt message here..."]').fill('Congratulations!')
  await accepted.page.locator('#rsvp button:has-text("Send RSVP")').click()
  await accepted.page.waitForTimeout(1800)

  check('a personalized confirmation appears', await accepted.page.locator('#rsvp .rsvp-done').isVisible())
  const confirmation = (await accepted.page.locator('#rsvp .rsvp-done h3').textContent().catch(() => '')) || ''
  check('the confirmation names the guest', confirmation.includes(`UI Accept ${stamp}`), confirmation)
  check('no error box after sending', !(await accepted.page.locator('#rsvp .rsvp-error').isVisible().catch(() => false)))

  await accepted.page.waitForTimeout(1200)
  check('the protected programme replaces the gate', (await accepted.page.locator('.gate-panel').count()) === 0)
  check('the curtain reveal is rendered', await accepted.page.locator('.curtain-wrap').isVisible())
  check('the entourage is rendered', await accepted.page.locator('#entourage .ent-role').count() > 0)
  check('wedding details are rendered', await accepted.page.locator('#details .floral-frame').isVisible())
  check('the venue maps are rendered', (await accepted.page.locator('#venue .mirror').count()) >= 1)
  check('the slideshow is rendered', await accepted.page.locator('#gallery .slideshow').isVisible())
  check('no page crash during the accept flow', accepted.crashes.length === 0, accepted.crashes.join(' | '))

  await accepted.page.reload({ waitUntil: 'domcontentloaded' })
  await accepted.page.waitForTimeout(2000)
  await accepted.page.click('.seal').catch(() => {})
  await accepted.page.waitForTimeout(1500)
  check('the programme stays unlocked after a reload', (await accepted.page.locator('#entourage .ent-role').count()) > 0)

  /* ------------------------------ decline flow ------------------------------- */
  const declinedCtx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const declined = await openPage(declinedCtx)

  await declined.page.locator('#rsvp').scrollIntoViewIfNeeded()
  await declined.page.locator('#rsvp input[placeholder="Enter your name..."]').fill(`UI Decline ${stamp}`)
  await declined.page.locator('#rsvp button:has-text("SORRY, I HAVE SOMETHING TO DO")').click()
  await declined.page.waitForTimeout(2000)

  check('a decline acknowledgement appears', await declined.page.locator('#rsvp .rsvp-done').isVisible())
  const declineText = (await declined.page.locator('#rsvp .rsvp-done h3').textContent().catch(() => '')) || ''
  check('the decline acknowledgement names the guest', declineText.includes(`UI Decline ${stamp}`), declineText)
  check('a declined visitor keeps the locked gate', await declined.page.locator('.gate-panel').isVisible())
  check('a declined visitor gets no curtain', (await declined.page.locator('.curtain-wrap').count()) === 0)
  check('no page crash during the decline flow', declined.crashes.length === 0, declined.crashes.join(' | '))

  /* ------------------------------- protection -------------------------------- */
  const anonCtx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const anon = await openPage(anonCtx)
  check('a fresh visitor sees the locked gate', await anon.page.locator('.gate-panel').isVisible())
  check('a fresh visitor sees no protected content', (await anon.page.locator('#entourage .ent-role').count()) === 0)

  /* ------------------------------- admin page -------------------------------- */
  const adminPage = await anonCtx.newPage()
  const adminCrashes = []
  adminPage.on('pageerror', (e) => adminCrashes.push(e.message))
  await adminPage.goto(`${BASE}/#admin`, { waitUntil: 'domcontentloaded' })
  await adminPage.waitForTimeout(1500)
  check('the admin route renders a login form', await adminPage.locator('input[placeholder="admin email"]').isVisible())
  check('no page crash on the admin route', adminCrashes.length === 0, adminCrashes.join(' | '))
} catch (err) {
  check('browser suite completed without throwing', false, err.message)
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} browser checks passed`)
if (failed.length) {
  console.log('\nFailures:')
  failed.forEach((f) => console.log(` - ${f.name}${f.detail ? ` :: ${f.detail}` : ''}`))
  process.exit(1)
}
