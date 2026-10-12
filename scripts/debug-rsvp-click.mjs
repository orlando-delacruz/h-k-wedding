/**
 * Reproduces the RSVP click the way a real browser does, and prints every
 * network call plus any console error, so a silent failure becomes visible.
 *
 * Run: node scripts/debug-rsvp-click.mjs
 * Requires the dev stack: npm run dev
 */
import { chromium } from 'playwright-core'

const BASE_URL = process.env.URL || 'http://localhost:5173'
const NAME = process.env.NAME || 'Browser Test Guest'

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
const page = await browser.newPage({ viewport: { width: 390, height: 844 } }) // phone-sized, mobile-first

const requests = []
page.on('request', (r) => {
  if (r.url().includes('/api/')) requests.push({ method: r.method(), url: r.url(), body: r.postData() })
})
page.on('response', async (r) => {
  if (r.url().includes('/api/')) {
    let body = ''
    try { body = (await r.text()).slice(0, 200) } catch {}
    console.log(`  << ${r.status()} ${r.request().method()} ${new URL(r.url()).pathname}  ${body}`)
  }
})
page.on('console', (m) => {
  if (m.type() === 'error') console.log(`  [console error] ${m.text()}`)
})
page.on('pageerror', (e) => console.log(`  [page error] ${e.message}`))

const step = (label) => console.log(`\n=== ${label} ===`)

try {
  step('load the page')
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  console.log('  title:', await page.title())

  step('open the sealed invitation')
  await page.click('.seal')
  await page.waitForTimeout(1600)

  step('scroll to RSVP')
  await page.locator('#rsvp').scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)

  step('fill the name')
  const nameInput = page.locator('#rsvp input[placeholder="Enter your name..."]')
  console.log('  name input count:', await nameInput.count())
  await nameInput.first().fill(NAME)
  console.log('  typed:', await nameInput.first().inputValue())

  step('check the attend button state')
  const attend = page.locator('#rsvp button:has-text("YES I\'M GOING TO ATTEND")')
  console.log('  attend button count:', await attend.count())
  console.log('  disabled?:', await attend.first().isDisabled())

  step('click "YES I\'M GOING TO ATTEND"')
  await attend.first().click()
  await page.waitForTimeout(900)

  step('what is on screen now?')
  console.log('  guest form visible:', await page.locator('#rsvp textarea[placeholder="Express your heartfelt message here..."]').isVisible().catch(() => false))
  console.log('  "Additional Guests" visible:', await page.locator('#rsvp .rsvp-eyebrow').isVisible().catch(() => false))
  console.log('  still on name step:', await page.locator('#rsvp input[placeholder="Enter your name..."]').isVisible().catch(() => false))
  console.log('  error box visible:', await page.locator('#rsvp .rsvp-error').isVisible().catch(() => false))
  const errText = await page.locator('#rsvp .rsvp-error').textContent().catch(() => null)
  if (errText) console.log('  error text:', errText.trim())

  step('try the full accept flow (companions + send)')
  const msgBox = page.locator('#rsvp textarea[placeholder="Express your heartfelt message here..."]')
  if (await msgBox.count()) {
    await page.locator('#rsvp input[placeholder="full name"]').first().fill('Companion One')
    await msgBox.fill('Congratulations from the browser test!')
    const send = page.locator('#rsvp button:has-text("Send RSVP")')
    console.log('  send button disabled?:', await send.first().isDisabled().catch(() => 'n/a'))
    await send.first().click()
    await page.waitForTimeout(1500)
    console.log('  confirmation visible:', await page.locator('#rsvp .rsvp-done').isVisible().catch(() => false))
    const conf = await page.locator('#rsvp .rsvp-done h3').textContent().catch(() => null)
    if (conf) console.log('  confirmation text:', conf.trim())
    console.log('  error box visible:', await page.locator('#rsvp .rsvp-error').isVisible().catch(() => false))
    const err2 = await page.locator('#rsvp .rsvp-error').textContent().catch(() => null)
    if (err2) console.log('  error text:', err2.trim())
  } else {
    console.log('  SKIPPED — the guest form never appeared, which is the reported bug')
  }

  step('is the programme unlocked?')
  console.log('  gate visible:', await page.locator('.gate-panel').isVisible().catch(() => false))
  console.log('  curtain visible:', await page.locator('.curtain-wrap').isVisible().catch(() => false))

  await page.screenshot({ path: 'rsvp-debug.png', fullPage: false })
  console.log('\n  screenshot saved: rsvp-debug.png')
} catch (err) {
  console.log('\n  [driver error]', err.message)
} finally {
  console.log('\n=== API calls made by the page (in order) ===')
  requests.forEach((r) => console.log(`  ${r.method} ${new URL(r.url).pathname}${r.body ? '  ' + r.body.slice(0, 120) : ''}`))
  await browser.close()
}
