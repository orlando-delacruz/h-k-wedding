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
  // The gate is now a single open column and can fit a phone screen, so the run
  // forces overflow: the invitation must still open on the hero for a guest who
  // had scrolled the gate before unlocking.
  await page.evaluate(() => { document.documentElement.style.minHeight = '180%' })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(400)
  const gateScroll = await page.evaluate(() => Math.round(window.scrollY))
  await page.evaluate(() => { document.documentElement.style.minHeight = '' })
  await page.click('.gate-code-btn')
  await page.waitForTimeout(700)
  check(`${tag}: gate was scrolled before unlocking`, gateScroll > 20, `scrollY=${gateScroll}`)
  check(`${tag}: the envelope blocks the hero`, await page.locator('.envelope').isVisible().catch(() => false))
  check(`${tag}: the flap is closed over the hero`, (await page.locator('.envelope-flap').count()) > 0)
  check(`${tag}: the hero is not shown yet`, (await page.locator('.envelope-letter').count()) > 0)
  check(`${tag}: the page is held still while opening`, await page.evaluate(() => document.body.classList.contains('no-scroll')))
  const flapA = await page.locator('.envelope-flap').evaluate((n) => getComputedStyle(n).transform).catch(() => 'none')
  await page.waitForTimeout(800)
  const flapB = await page.locator('.envelope-flap').evaluate((n) => getComputedStyle(n).transform).catch(() => 'none')
  check(`${tag}: the flap swings open in 3D`, flapA !== flapB && /matrix3d/.test(flapB), `${flapA.slice(0, 24)} -> ${flapB.slice(0, 24)}`)
  await page.click('.envelope-skip')
  await page.waitForTimeout(1300)
  const opened = await page.evaluate(() => Math.round(window.scrollY))
  check(`${tag}: invitation opens at the top`, opened === 0, `scrollY=${opened}`)
  check(`${tag}: invitation opens with the configured code`, await page.locator('#top .hero-card').isVisible().catch(() => false))
  check(`${tag}: the envelope is gone after unveiling`, (await page.locator('.envelope-layer').count()) === 0)
  check(`${tag}: the page can move again`, !(await page.evaluate(() => document.body.classList.contains('no-scroll'))))
  // The song must really play, not just arm: it starts inside the code-click
  // gesture, which is what browser autoplay rules require.
  const audio = await page.evaluate(() => {
    const a = document.querySelector('audio')
    return a ? { paused: a.paused, src: a.currentSrc.split('/').pop() } : null
  })
  check(`${tag}: the default song starts with the opening`, !!audio && audio.paused === false, JSON.stringify(audio))
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
    check(`${tag}: gate shows the RSVP deadline`, /Please Respond before November 15, 2026/.test(await page.locator('.gate-deadline').innerText().catch(() => '')))
    check(`${tag}: gate shows the attendance line`, /Please confirm your attendance on our Wedding Day/.test(await page.locator('.gate-step-title').first().innerText().catch(() => '')))
    check(`${tag}: gate shows no crest ring`, (await page.locator('.gate-crest').count()) === 0)
    check(`${tag}: gate shows no kicker`, (await page.locator('.gate-kicker').count()) === 0)
    check(`${tag}: gate shows no step badges`, (await page.locator('.gate-step-badge').count()) === 0)
    check(`${tag}: gate shows no labelled code field`, (await page.locator('.gate-step .field-label').count()) === 0)
    await noOverflow(page, `${tag}: gate`)

    await page.fill('.gate-input', `${CODE}X`)
    await page.click('.gate-code-btn')
    await page.waitForTimeout(400)
    check(`${tag}: wrong code shows an error`, await page.locator('.gate-step .form-error').isVisible())
    check(`${tag}: wrong code keeps the invitation closed`, (await page.locator('#top .hero-card').count()) === 0)

    await unlock(page, tag)
    check(`${tag}: chrome appears once unlocked`, await page.locator('.bottom-nav.show').isVisible())

    /* ------------------------- invitation hero → footer ------------------------ */
    check(`${tag}: the envelope is gone once inside`, (await page.locator('.envelope-layer').count()) === 0)
    await seeSection(page, `${tag}: hero invitation card`, '#top .hero-card')
    await seeSection(page, `${tag}: portrait`, '#portrait .portrait-img')
    check(`${tag}: invitation has no RSVP section`, (await page.locator('#rsvp').count()) === 0)
    await seeSection(page, `${tag}: venues`, '#venue .venue-block')
    check(`${tag}: countdown shows 4 boxes`, (await page.locator('#countdown .count-box').count()) === 4)
    await seeSection(page, `${tag}: calendar`, '#countdown .calendar-card')
    check(`${tag}: no in-details curtain`, (await page.locator('#music .curtain-wrap').count()) === 0)
    check(`${tag}: no gramophone card`, (await page.locator('#music .gramo-card').count()) === 0)
    await seeSection(page, `${tag}: venue maps`, '#venue .map-frame')
    await seeSection(page, `${tag}: programme outline`, '.stage-list')
    await seeSection(page, `${tag}: story card`, '#story .story-card')
    await seeSection(page, `${tag}: entourage frame`, '#entourage .ent-frame')
    check(`${tag}: entourage names carry no boxes`, (await page.evaluate(() => {
      const names = [...document.querySelectorAll('#entourage .pair-card span, #entourage .chip, #entourage .duo-card b, #entourage .sponsor span')]
      return names.filter((n) => {
        const s = getComputedStyle(n)
        return (parseFloat(s.borderTopWidth) + parseFloat(s.borderLeftWidth)) > 0 || (s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent')
      }).length
    })) === 0)
    check(`${tag}: entourage roles rendered`, (await page.locator('#entourage .ent-role').count()) >= 4)
    check(`${tag}: sponsor pairs rendered`, (await page.locator('#entourage .pair-card').count()) >= 10)
    check(`${tag}: no pair numbers are printed`, (await page.locator('#entourage .pair-card em, #entourage .sponsor em').count()) === 0)
    check(`${tag}: secondary sponsors are centred on mobile`, await page.evaluate(() => {
      const row = document.querySelector('#entourage .sponsor')
      if (!row) return false
      const r = row.getBoundingClientRect()
      const t = row.querySelector('span')?.getBoundingClientRect()
      if (!t) return false
      return Math.abs((r.left + r.width / 2) - (t.left + t.width / 2)) < 2 && getComputedStyle(row).justifyContent === 'center'
    }))
    await seeSection(page, `${tag}: wedding details`, '#details .floral-frame')
    check(`${tag}: the attire guide is shown whole (contain)`, await page.evaluate(() => {
      const img = document.querySelector('.attire-img')
      if (!img || !img.complete || !img.naturalWidth) return false
      const s = getComputedStyle(img)
      const r = img.getBoundingClientRect()
      // Square source, square box, contain: nothing is cropped away.
      return s.objectFit === 'contain'
        && Math.abs(img.naturalWidth / img.naturalHeight - 1) < 0.01
        && Math.abs(r.width - r.height) < 2
        && r.width > 200
    }))
    const qrCount = await page.locator('#details .qr-row .qr-img').count()
    check(`${tag}: the three gift QR codes render`, qrCount === 3, `count=${qrCount}`)
    check(`${tag}: gift QR codes are labelled`, /GCash.*China Bank.*Mari Bank/.test((await page.locator('#details .qr-label').allTextContents()).join('|')))
    check(`${tag}: gift QR codes are loaded, square and uncropped`, await page.evaluate(() => {
      const imgs = [...document.querySelectorAll('#details .qr-img')]
      return imgs.length === 3 && imgs.every((i) => {
        const r = i.getBoundingClientRect()
        return i.complete && i.naturalWidth > 0 && getComputedStyle(i).objectFit === 'contain' && Math.abs(r.width - r.height) < 2 && r.width >= 150
      })
    }))
    await page.locator('.qr-tap').first().click()
    await page.waitForTimeout(450)
    check(`${tag}: tapping a code opens the full preview`, await page.locator('.qr-modal img').isVisible().catch(() => false))
    const preview = await page.locator('.qr-modal img').evaluate((n) => {
      const r = n.getBoundingClientRect()
      return { w: Math.round(r.width), h: Math.round(r.height), fit: getComputedStyle(n).objectFit, ar: n.naturalWidth / n.naturalHeight }
    }).catch(() => null)
    check(`${tag}: the preview is large and whole`, !!preview
      && preview.w >= 260
      && preview.fit === 'contain'
      // The box keeps the photo's own proportions: the whole code, uncropped.
      && Math.abs(preview.w / preview.h - preview.ar) < 0.02 * preview.ar,
    JSON.stringify(preview))
    check(`${tag}: the preview holds the page still`, await page.evaluate(() => document.body.classList.contains('no-scroll')))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    check(`${tag}: Escape closes the preview`, (await page.locator('.qr-modal').count()) === 0)
    check(`${tag}: the page scrolls again after the preview`, !(await page.evaluate(() => document.body.classList.contains('no-scroll'))))
    await seeSection(page, `${tag}: slideshow`, '#gallery .slideshow')
    await seeSection(page, `${tag}: footer`, '.footer')
    await noOverflow(page, `${tag}: full page`)

    /* ---------------------------- the player picks songs ---------------------- */
    // The page sweep above scrolled down, so the player is folded to the disc.
    if (await page.locator('.music-bar.collapsed').count()) {
      await page.locator('.mb-deck').click()
      await page.waitForTimeout(700)
    }
    await page.locator('.mb-meta').click()
    await page.waitForTimeout(400)
    check(`${tag}: player opens a song list`, await page.locator('.mb-menu .mb-track').first().isVisible().catch(() => false))
    check(`${tag}: both songs are offered`, (await page.locator('.mb-menu .mb-track').count()) === 2)
    await page.locator('.mb-menu .mb-track').nth(1).click()
    await page.waitForTimeout(1200)
    const picked = await page.locator('.mb-title').innerText().catch(() => '')
    check(`${tag}: choosing a song switches the track`, /Paninindigan/i.test(picked), picked)
    const pickedSrc = await page.locator('audio').evaluate((a) => a.currentSrc || a.src).catch(() => '')
    check(`${tag}: chosen file is played`, /paninindigan-kita\.mp3$/.test(pickedSrc), pickedSrc)

    /* the player rolls on to the next track by itself */
    await page.locator('audio').evaluate((a) => a.dispatchEvent(new Event('ended')))
    await page.waitForTimeout(1200)
    const rolled = await page.locator('.mb-title').innerText().catch(() => '')
    const rolledSrc = await page.locator('audio').evaluate((a) => a.currentSrc || a.src).catch(() => '')
    check(`${tag}: a finished song rolls into the next`, /Pahintulot/i.test(rolled) && /pahintulot\.mp3$/.test(rolledSrc), `${rolled} :: ${rolledSrc}`)

    /* scrolling folds the nameplate away; tapping brings it back */
    await page.evaluate(() => window.scrollTo(0, 600))
    await page.waitForTimeout(400)
    await page.evaluate(() => window.scrollTo(0, 1900))
    await page.waitForTimeout(700)
    check(`${tag}: scrolling collapses the player to the disc`, await page.locator('.music-bar.collapsed').isVisible().catch(() => false))
    const titleShown = await page.locator('.mb-meta').isVisible().catch(() => false)
    check(`${tag}: collapsed player hides the title`, !titleShown)
    await page.locator('.mb-deck').click()
    await page.waitForTimeout(600)
    check(`${tag}: tapping the disc brings the title back`, await page.locator('.music-bar.collapsed').count() === 0)

    /* --------------------------------- chrome ---------------------------------- */
    const navCount = await page.locator('.bottom-nav a').count()
    check(`${tag}: bottom nav shows all anchors`, navCount === 5, `links=${navCount}`)
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
    check(`${tag}: no envelope on refresh`, (await page.locator('.envelope-layer').count()) === 0)

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
