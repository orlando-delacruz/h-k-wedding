/**
 * Browser end-to-end tests for the public invitation site + mobile audit.
 * Runs headless Chrome against the Vite dev server. The RSVP form is a Google
 * Form and the access code comes from `src/config/site.js`; the suite reads that
 * value so the two never drift apart.
 *
 * Run:  npm run dev                  (in another terminal)
 *       npm run test:ui
 */
import { chromium } from 'playwright-core'
import { loadEnv } from 'vite'
import fs from 'fs'
import os from 'os'
import path from 'path'

const BASE = process.env.URL || 'http://localhost:5173'
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SHOT_DIR = process.env.SHOT_DIR || path.join(os.tmpdir(), 'hk-shots')

const siteConfig = fs.readFileSync(path.join(process.cwd(), 'src', 'config', 'site.js'), 'utf8')
const FORM_LINK = siteConfig.match(/linkUrl:\s*'([^']+)'/)[1]
// Resolve the gate code the way Vite does: shell env + .env files, then the
// fallback constant in site.js.
const env = loadEnv('development', process.cwd(), 'VITE_')
const CODE = (env.VITE_ACCESS_CODE || '').trim() || siteConfig.match(/FALLBACK_ACCESS_CODE = '([^']+)'/)[1]

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail && !ok ? `  — ${detail}` : ''}`)
}

async function openPage(context) {
  const page = await context.newPage()
  const crashes = []
  page.on('pageerror', (e) => crashes.push(e.message))
  // Failed subresources inside third-party iframes (Form, Maps) surface as bare
  // console errors with no URL. Only first-party failures count.
  page.on('response', (r) => {
    if (r.status() >= 400 && r.url().includes('localhost:')) crashes.push(`${r.status()} ${r.url()}`)
  })
  page.on('console', (m) => {
    if (m.type() === 'error' && !/maps|google|fonts|woff2|filesystem|Failed to load resource/i.test(m.text())) crashes.push(m.text())
  })
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(800)
  return { page, crashes }
}

async function noOverflow(page, label) {
  const v = await page.evaluate(() => ({
    sw: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    iw: window.innerWidth,
  }))
  check(`${label}: no horizontal overflow`, v.sw <= v.iw + 1, `scrollWidth=${v.sw} innerWidth=${v.iw}`)
}

async function seeSection(page, label, selector) {
  await page.locator(selector).first().scrollIntoViewIfNeeded().catch(() => {})
  await page.waitForTimeout(1100)
  const el = page.locator(selector).first()
  const visible = await el.isVisible().catch(() => false)
  check(`${label} renders`, visible, selector)
  // isVisible ignores opacity: the reveal system must actually paint the node.
  const opacity = await el.evaluate((n) => parseFloat(getComputedStyle(n).opacity)).catch(() => 0)
  check(`${label} is painted (opacity)`, opacity > 0.5, `opacity=${opacity}`)
  return visible && opacity > 0.5
}

/** Type the access code and wait for the invitation to mount. */
async function unlock(page, tag, code = CODE) {
  await page.fill('.gate-input', code)
  await page.click('.gate-code-btn')
  await page.waitForTimeout(700)
  check(`${tag}: entry curtain blocks the hero`, await page.locator('.entry-curtain').isVisible().catch(() => false))
  check(`${tag}: hero stays covered until the opening`, (await page.locator('.entry-curtain:not(.leaving)').count()) > 0)
  await page.click('.entry-skip')
  await page.waitForTimeout(1300)
  check(`${tag}: invitation opens with the configured code`, await page.locator('#top .hero-card').isVisible().catch(() => false))
  check(`${tag}: entry curtain is gone after unveiling`, (await page.locator('.entry-curtain').count()) === 0)
  const audioSrc = await page.locator('audio').evaluate((a) => a.currentSrc || a.src).catch(() => '')
  check(`${tag}: player serves the local track`, (audioSrc || '').includes('/music/'), audioSrc)
  // Headless autoplay may still be settling: accept playing now or the tap
  // fallback the player shows when the browser refused.
  let sounding = false
  for (let i = 0; i < 10 && !sounding; i++) {
    sounding = await page.locator('.music-bar.is-playing').isVisible().catch(() => false)
      || await page.locator('.gramo-fallback').isVisible().catch(() => false)
    if (!sounding) await page.waitForTimeout(1000)
  }
  check(`${tag}: music starts or offers tap-to-play`, sounding)
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true })

try {
  for (const viewport of [{ width: 360, height: 740 }, { width: 390, height: 844 }]) {
    const tag = `${viewport.width}px`
    const ctx = await browser.newContext({ viewport })
    const { page, crashes } = await openPage(ctx)

    /* ----------------------------- access gate ------------------------------- */
    check(`${tag}: first view is the access gate`, await page.locator('.access-gate').isVisible())
    check(`${tag}: invitation is not mounted while locked`, (await page.locator('#top .hero-card').count()) === 0)
    check(`${tag}: no chrome while locked`, (await page.locator('.bottom-nav.show').count()) === 0)
    const formHref = await page.locator('.gate-form-btn').getAttribute('href').catch(() => '')
    check(`${tag}: gate links to the Google Form`, formHref === FORM_LINK, formHref)
    check(`${tag}: gate form button opens a new tab`, await page.locator('.gate-form-btn').getAttribute('target') === '_blank')
    check(`${tag}: gate shows the RSVP deadline`, /NOVEMBER 15, 2026/.test(await page.locator('.gate-deadline').innerText().catch(() => '')))
    await noOverflow(page, `${tag}: gate`)

    await page.fill('.gate-input', `${CODE}X`)
    await page.click('.gate-code-btn')
    await page.waitForTimeout(400)
    check(`${tag}: wrong code shows an error`, await page.locator('.code-panel .form-error').isVisible())
    check(`${tag}: wrong code keeps the invitation closed`, (await page.locator('#top .hero-card').count()) === 0)

    await unlock(page, tag)
    check(`${tag}: chrome appears once unlocked`, await page.locator('.bottom-nav.show').isVisible())

    /* ------------------------- invitation hero → footer ------------------------ */
    check(`${tag}: no envelope intro overlay`, (await page.locator('.intro').count()) === 0)
    await seeSection(page, `${tag}: hero invitation card`, '#top .hero-card')
    await seeSection(page, `${tag}: portrait`, '#portrait .portrait-img')
    check(`${tag}: invitation has no RSVP section`, (await page.locator('#rsvp').count()) === 0)
    await seeSection(page, `${tag}: venues`, '#venue .venue-block')
    check(`${tag}: countdown shows 4 boxes`, (await page.locator('#countdown .count-box').count()) === 4)
    await seeSection(page, `${tag}: calendar`, '#countdown .calendar-card')
    await seeSection(page, `${tag}: curtain`, '#music .curtain-wrap')
    await seeSection(page, `${tag}: gramophone`, '#music .gramo-card')
    check(`${tag}: 2 songs listed`, (await page.locator('#music .song-chip').count()) === 2)
    await seeSection(page, `${tag}: venue maps`, '#venue .mirror')
    await seeSection(page, `${tag}: programme outline`, '.stage-list')
    await seeSection(page, `${tag}: story card`, '#story .story-card')
    check(`${tag}: entourage roles rendered`, (await page.locator('#entourage .ent-role').count()) >= 4)
    check(`${tag}: sponsor pairs rendered`, (await page.locator('#entourage .pair-card').count()) >= 10)
    await seeSection(page, `${tag}: wedding details`, '#details .floral-frame')
    await seeSection(page, `${tag}: slideshow`, '#gallery .slideshow')
    await seeSection(page, `${tag}: footer`, '.footer')
    await noOverflow(page, `${tag}: full page`)

    /* --------------------------------- curtain --------------------------------- */
    await page.locator('#music .curtain-cta').click().catch(() => {})
    await page.waitForTimeout(6500)
    check(`${tag}: curtain opens on tap`, await page.locator('#music .curtain-wrap.is-open').isVisible().catch(() => false))
    check(`${tag}: reveal copy appears`, await page.locator('.curtain-reveal.shown').isVisible().catch(() => false))

    /* --------------------------------- chrome ---------------------------------- */
    const navCount = await page.locator('.bottom-nav a').count()
    check(`${tag}: bottom nav shows all anchors`, navCount === 7, `links=${navCount}`)
    const navFits = await page.evaluate(() => {
      const nav = document.querySelector('.bottom-nav')
      return nav ? nav.scrollWidth <= nav.clientWidth + 1 : false
    })
    check(`${tag}: bottom nav fits without scrolling`, navFits)
    const smallTargets = await page.evaluate(() =>
      [...document.querySelectorAll('.bottom-nav a')].filter((a) => {
        const r = a.getBoundingClientRect()
        return r.height < 24 || r.width < 24
      }).length
    )
    check(`${tag}: nav targets are tappable (>=24px)`, smallTargets === 0, `small=${smallTargets}`)

    if (viewport.width === 360) {
      fs.mkdirSync(SHOT_DIR, { recursive: true })
      await page.screenshot({ path: path.join(SHOT_DIR, 'mobile-360-full.png'), fullPage: true })
    }

    /* ------------------------- unlock persistence ------------------------------ */
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1200)
    check(`${tag}: a refresh keeps the guest inside`, await page.locator('#top .hero-card').isVisible().catch(() => false))
    check(`${tag}: no entry curtain on refresh`, (await page.locator('.entry-curtain').count()) === 0)

    await page.evaluate(() => localStorage.setItem('hk_access', 'ROTATED-CODE'))
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(900)
    check(`${tag}: a rotated code locks the page again`, await page.locator('.access-gate').isVisible().catch(() => false))

    check(`${tag}: no page crash or console error`, crashes.length === 0, crashes.join(' | ').slice(0, 400))
    await ctx.close()
  }
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
