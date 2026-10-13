/**
 * Browser end-to-end tests for the public invitation site + mobile audit.
 * Runs headless Chrome against the Vite dev server. No backend exists:
 * every section is public and must render, paint, and fit small screens.
 *
 * Run:  npm run dev                  (in another terminal)
 *       npm run test:ui
 */
import { chromium } from 'playwright-core'
import fs from 'fs'
import path from 'path'

const BASE = process.env.URL || 'http://localhost:5173'
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SHOT_DIR = process.env.SHOT_DIR || 'C:/Users/SSD-ORLANDO/AppData/Local/Temp/hk-shots'

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

const browser = await chromium.launch({ executablePath: CHROME, headless: true })

try {
  for (const viewport of [{ width: 360, height: 740 }, { width: 390, height: 844 }]) {
    const tag = `${viewport.width}px`
    const ctx = await browser.newContext({ viewport })
    const { page, crashes } = await openPage(ctx)

    /* ------------------------- invitation hero → footer ------------------------ */
    check(`${tag}: no envelope intro overlay`, (await page.locator('.intro').count()) === 0)
    check(`${tag}: no program gate`, (await page.locator('.gate-panel').count()) === 0)
    await seeSection(page, `${tag}: hero invitation card`, '#top .hero-card')
    await seeSection(page, `${tag}: portrait`, '#portrait .portrait-img')
    await seeSection(page, `${tag}: rsvp card`, '#rsvp .rsvp-card')
    await seeSection(page, `${tag}: venues`, '#venue .venue-block')
    check(`${tag}: countdown shows 4 boxes`, (await page.locator('#countdown .count-box').count()) === 4)
    await seeSection(page, `${tag}: calendar`, '#countdown .calendar-card')
    await seeSection(page, `${tag}: curtain`, '#music .curtain-wrap')
    await seeSection(page, `${tag}: gramophone`, '#music .gramo-card')
    check(`${tag}: 3 songs listed`, (await page.locator('#music .song-chip').count()) === 3)
    await seeSection(page, `${tag}: venue maps`, '#venue .mirror')
    await seeSection(page, `${tag}: programme outline`, '.stage-list')
    await seeSection(page, `${tag}: story card`, '#story .story-card')
    check(`${tag}: entourage roles rendered`, (await page.locator('#entourage .ent-role').count()) >= 4)
    check(`${tag}: sponsor pairs rendered`, (await page.locator('#entourage .pair-card').count()) >= 10)
    await seeSection(page, `${tag}: wedding details`, '#details .floral-frame')
    await seeSection(page, `${tag}: slideshow`, '#gallery .slideshow')
    await seeSection(page, `${tag}: footer`, '.footer')
    await noOverflow(page, `${tag}: full page`)

    /* ------------------------------ rsvp form embed ---------------------------- */
    check(`${tag}: facade offers one-tap form load`, await page.locator('#rsvp button:has-text("Load RSVP Form")').isVisible())
    await page.locator('#rsvp button:has-text("Load RSVP Form")').click()
    await page.waitForTimeout(2500)
    const frameSrc = await page.locator('#rsvp iframe[title="RSVP form"]').getAttribute('src').catch(() => '')
    check(`${tag}: form iframe loads on tap with configured URL`, (frameSrc || '').includes('docs.google.com/forms/d/e/'), frameSrc)
    const formHref = await page.locator('#rsvp a:has-text("Open RSVP Form")').getAttribute('href').catch(() => '')
    check(`${tag}: fallback link points at the Google Form`, /forms\.gle/.test(formHref || ''), formHref)
    check(`${tag}: fallback opens a new tab`, await page.locator('#rsvp a:has-text("Open RSVP Form")').getAttribute('target') === '_blank')

    /* --------------------------------- curtain --------------------------------- */
    await page.locator('#music .curtain-cta').click().catch(() => {})
    await page.waitForTimeout(6500)
    check(`${tag}: curtain opens on tap`, await page.locator('#music .curtain-wrap.is-open').isVisible().catch(() => false))
    check(`${tag}: reveal copy appears`, await page.locator('.curtain-reveal.shown').isVisible().catch(() => false))

    /* --------------------------------- chrome ---------------------------------- */
    const navCount = await page.locator('.bottom-nav a').count()
    check(`${tag}: bottom nav shows all anchors`, navCount === 8, `links=${navCount}`)
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
