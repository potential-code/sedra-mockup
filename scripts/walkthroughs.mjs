// Brief §10 acceptance rows as scripted flows. Prints PASS/FAIL lines; exit code 1 on any FAIL.
// Usage: node scripts/walkthroughs.mjs   (BASE=http://127.0.0.1:5194/ by default)
import { readFileSync } from 'node:fs'
import {
  blockThirdParty,
  collectErrors,
  launch,
  patchDb,
  readDb,
  reporter,
  signIn,
  unitPath,
  url,
} from './lib.mjs'

const browser = await launch()
const all = []

/** Spy on media play()/pause() calls and real 'play' events (works even without H.264). */
const MEDIA_SPY = () => {
  window.__media = { playCalls: 0, pauseCalls: 0, playEvents: 0 }
  const P = HTMLMediaElement.prototype
  const play = P.play
  const pause = P.pause
  P.play = function (...a) {
    window.__media.playCalls++
    return play.apply(this, a)
  }
  P.pause = function (...a) {
    window.__media.pauseCalls++
    return pause.apply(this, a)
  }
  document.addEventListener('play', () => window.__media.playEvents++, true)
}

async function newPage(width = 1280) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true })
  await blockThirdParty(ctx)
  await ctx.addInitScript(MEDIA_SPY)
  const page = await ctx.newPage()
  const errs = collectErrors(page)
  return { ctx, page, errs }
}

const visible = (page, text) =>
  page
    .getByText(text, { exact: false })
    .first()
    .isVisible()
    .catch(() => false)

/** Press Tab until predicate(activeElement info) is true. Returns the info or null. */
async function tabTo(page, pred, max = 120, key = 'Tab') {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press(key)
    const info = await page.evaluate(() => {
      const a = document.activeElement
      return {
        tag: a?.tagName,
        href: a?.getAttribute?.('href') ?? '',
        text: (a?.getAttribute?.('aria-label') || a?.textContent || '').trim().slice(0, 80),
        type: a?.getAttribute?.('type') ?? '',
        value: a?.value ?? '',
        checked: !!a?.checked,
      }
    })
    if (pred(info)) return info
  }
  return null
}

// ---------------------------------------------------------------- Walkthrough A
{
  const R = reporter('A')
  all.push(R)
  const { ctx, page, errs } = await newPage()
  try {
    await signIn(page, 'Noor')
    await page.goto(url('/preferences'))
    await page.getByRole('radio', { name: 'English' }).check()
    await page.getByRole('radio', { name: '125%' }).check()
    await page.waitForTimeout(200)
    const html = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      text: document.documentElement.dataset.text,
      fs: getComputedStyle(document.documentElement).fontSize,
    }))
    R.ok(
      html.lang === 'en' && html.dir !== 'rtl',
      'English set (html lang=en, ltr)',
      JSON.stringify(html),
    )
    R.ok(html.text === '125', 'Text size 125% applied (html[data-text=125])', JSON.stringify(html))
    const db0 = await readDb(page)
    R.ok(
      db0.prefs.textSize === 125 && db0.prefs.lang === 'en',
      'Prefs persisted',
      JSON.stringify(db0.prefs),
    )

    await page.goto(url('/learn'))
    await page.getByRole('link', { name: 'Continue learning' }).first().click()
    await page.waitForURL(/units\/LS02/, { timeout: 5000 }).catch(() => {})
    R.ok(/units\/LS02/.test(page.url()), 'Continue learning opens LS02', page.url())

    const vid = page.locator('video').first()
    await vid.waitFor({ timeout: 5000 })
    const v0 = await vid.evaluate((v) => ({
      paused: v.paused,
      autoplay: v.hasAttribute('autoplay'),
      t: v.currentTime,
    }))
    R.ok(
      v0.paused && !v0.autoplay,
      'Video not autoplaying on load (paused, no autoplay attr)',
      JSON.stringify(v0),
    )
    const h264 = await page.evaluate(() =>
      document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"'),
    )

    await page.getByRole('button', { name: 'Play video' }).click()
    await page.waitForTimeout(1200)
    let m = await page.evaluate(() => window.__media)
    const vPlay = await vid.evaluate((v) => ({
      paused: v.paused,
      t: v.currentTime,
      err: v.error?.code,
    }))
    if (h264) {
      R.ok(!vPlay.paused && vPlay.t > 0, 'Play starts playback', JSON.stringify(vPlay))
    } else {
      R.ok(
        m.playCalls >= 1,
        'Play calls video.play() (browser lacks H.264; real playback not testable here)',
        JSON.stringify(m),
      )
    }
    const pauseBtn = page.getByRole('button', { name: /Pause video|Play video|Play again/ })
    await pauseBtn.first().click()
    await page.waitForTimeout(300)
    const vPause = await vid.evaluate((v) => v.paused)
    R.ok(vPause, 'Pause leaves video paused', `paused=${vPause}`)
    await page.getByRole('button', { name: 'Replay from the start' }).click()
    await page.waitForTimeout(600)
    m = await page.evaluate(() => window.__media)
    const vRep = await vid.evaluate((v) => ({ paused: v.paused, t: v.currentTime }))
    R.ok(
      m.playCalls >= 2 && vRep.t < 2,
      'Replay restarts from 0 and calls play()',
      JSON.stringify({ ...vRep, ...m }),
    )
    await vid.evaluate((v) => v.pause())

    await page.getByRole('button', { name: 'Read transcript' }).click()
    await page.waitForTimeout(500)
    R.ok(
      await visible(page, 'Pause and notice how you feel'),
      'Transcript opens and shows LS02 narration',
    )

    await page.getByRole('button', { name: 'Next: question' }).click()
    await page.getByRole('radio', { name: /Think/ }).check()
    await page.getByRole('button', { name: 'Check answer' }).click()
    await page.waitForTimeout(300)
    R.ok(
      await visible(page, 'Yes. Think about your choices before you act.'),
      'Answer B shows correct feedback',
    )

    await page.getByRole('button', { name: 'Practise (optional)' }).click()
    await page.getByRole('button', { name: 'Later', exact: true }).click()
    await page.waitForTimeout(200)
    let db = await readDb(page)
    R.ok(
      db.learners.noor.progress.LS02?.practice === 'later',
      'Practice marked Later (saved)',
      JSON.stringify(db.learners.noor.progress.LS02),
    )

    await page.getByRole('button', { name: /^Next/ }).first().click()
    await page.waitForURL(/units\/LS03/, { timeout: 5000 }).catch(() => {})
    R.ok(/units\/LS03/.test(page.url()), 'Next opens LS03', page.url())
    const step3 = await page.locator('#step-title').innerText()
    const anyPlaying = await page.evaluate(() =>
      [...document.querySelectorAll('video')].some((v) => !v.paused),
    )
    R.ok(
      step3 === 'Watch or read' && !anyPlaying,
      'LS03 opens at the start step, nothing playing',
      `step=${step3}`,
    )

    // Move to the question step so resume restores a non-default step.
    await page.getByRole('button', { name: 'Next: question' }).click()
    await page.waitForTimeout(200)
    await page.reload()
    await page.waitForTimeout(500)
    const afterReload = await page
      .locator('#step-title')
      .innerText()
      .catch(() => '')
    R.ok(
      /units\/LS03/.test(page.url()) && afterReload === 'Try one question',
      'Reload restores LS03 + Question step',
      `${page.url()} step=${afterReload}`,
    )

    await page.goto(url('/learn'))
    await page.getByRole('link', { name: 'Continue learning' }).first().click()
    await page.waitForURL(/units\/LS03/, { timeout: 5000 }).catch(() => {})
    const resumed = await page
      .locator('#step-title')
      .innerText()
      .catch(() => '')
    R.ok(
      /units\/LS03/.test(page.url()) && resumed === 'Try one question',
      'Continue learning resumes LS03 same step',
      `${page.url()} step=${resumed}`,
    )
    db = await readDb(page)
    R.ok(
      db.learners.noor.progress.LS02?.checkReviewed &&
        db.learners.noor.progress.LS02?.watchedOrRead !== undefined,
      'LS02 progress kept after reload',
      JSON.stringify(db.learners.noor.progress.LS02),
    )
    R.ok(errs.length === 0, 'No console errors', errs.slice(0, 3).join(' | '))
  } catch (e) {
    R.ok(false, 'Walkthrough A ran to completion', e.message.split('\n')[0])
  }
  await ctx.close()
}

// ---------------------------------------------------------------- Walkthrough B (keyboard only)
{
  const R = reporter('B')
  all.push(R)
  const { ctx, page, errs } = await newPage()
  try {
    await signIn(page, 'Noor') // setup only; the flow below is keyboard only
    await page.goto(url('/learn'))
    await page.waitForTimeout(300)
    await page.evaluate(() => document.activeElement?.blur())
    const sw = await tabTo(page, (i) => /Switch language|العربية/.test(i.text))
    R.ok(!!sw, 'Language switch reachable by Tab')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    const html = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
    }))
    R.ok(
      html.lang === 'ar' && html.dir === 'rtl',
      'Arabic: html lang=ar dir=rtl',
      JSON.stringify(html),
    )

    await page.evaluate(() => document.activeElement?.blur())
    const prog = await tabTo(page, (i) => i.tag === 'A' && /programmes\/hospitality/.test(i.href))
    R.ok(
      !!prog,
      'Hospitality programme link reachable by Tab from dashboard',
      prog ? '' : 'not found',
    )
    await page.keyboard.press('Enter')
    await page.waitForURL(/programmes\/hospitality/, { timeout: 5000 }).catch(() => {})
    const unitLink = await tabTo(page, (i) => i.tag === 'A' && /units\/HF01/.test(i.href))
    R.ok(!!unitLink, 'HF01 link reachable by Tab on programme page')
    await page.keyboard.press('Enter')
    await page.waitForURL(/units\/HF01/, { timeout: 5000 }).catch(() => {})
    R.ok(/units\/HF01/.test(page.url()), 'HF01 opened by keyboard', page.url())

    // Read the text alternative.
    const readBtn = await tabTo(page, (i) => i.tag === 'BUTTON' && /اقرأ الدرس/.test(i.text))
    R.ok(!!readBtn, 'Arabic "Read lesson" button reachable')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    const focusAfterRead = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      text: document.activeElement?.textContent?.trim().slice(0, 60),
    }))
    R.ok(
      /^H[1-6]$/.test(focusAfterRead.tag),
      'Read lesson moves focus to the text alternative heading',
      JSON.stringify(focusAfterRead),
    )
    const markRead = await tabTo(page, (i) => i.tag === 'BUTTON' && /قرأتُ هذا/.test(i.text))
    R.ok(!!markRead, '"I have read this" reachable by Tab')
    if (markRead) await page.keyboard.press('Space')
    await page.waitForTimeout(200)

    const toQ = await tabTo(page, (i) => i.tag === 'BUTTON' && /التالي: السؤال/.test(i.text))
    R.ok(!!toQ, '"Next: question" reachable by Tab')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    const radio = await tabTo(page, (i) => i.tag === 'INPUT' && i.type === 'radio')
    R.ok(!!radio, 'Answer radios reachable by Tab')
    // Space selects the focused (first) radio, ArrowDown moves to B.
    await page.keyboard.press('Space')
    await page.keyboard.press('ArrowDown')
    let sel = await page.evaluate(() => document.querySelector('input[type=radio]:checked')?.value)
    if (sel !== 'B') {
      await page.keyboard.press('ArrowUp')
      sel = await page.evaluate(() => document.querySelector('input[type=radio]:checked')?.value)
    }
    R.ok(sel === 'B', 'Answer B selected with arrow keys', `selected=${sel}`)
    const submit = await tabTo(page, (i) => i.tag === 'BUTTON' && i.type === 'submit')
    R.ok(!!submit, 'Check answer reachable by Tab')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    let db = await readDb(page)
    R.ok(
      db.learners.noor.progress.HF01?.checkOutcome === 'correct',
      'HF01 reviewed as correct',
      JSON.stringify(db.learners.noor.progress.HF01),
    )
    R.ok(await visible(page, 'أحسنت'), 'Arabic correct feedback shown')

    // Return to dashboard by keyboard (Home link).
    await page.evaluate(() => document.activeElement?.blur())
    const home = await tabTo(page, (i) => i.tag === 'A' && /#\/learn$/.test(i.href))
    R.ok(!!home, 'Home/dashboard link reachable by Tab')
    await page.keyboard.press('Enter')
    await page.waitForURL(/#\/learn$/, { timeout: 5000 }).catch(() => {})
    R.ok(/#\/learn$/.test(page.url()), 'Returned to dashboard', page.url())

    // Switch programme: Life Skills then back to Hospitality.
    await page.evaluate(() => document.activeElement?.blur())
    const ls = await tabTo(page, (i) => i.tag === 'A' && /programmes\/life-skills/.test(i.href))
    R.ok(!!ls, 'Life Skills programme link reachable by Tab')
    await page.keyboard.press('Enter')
    await page.waitForURL(/programmes\/life-skills/, { timeout: 5000 }).catch(() => {})
    await page.goto(url('/programmes/hospitality'))
    await page.waitForTimeout(300)
    db = await readDb(page)
    const p = db.learners.noor.progress
    R.ok(
      p.HF01?.checkReviewed && p.HF01?.watchedOrRead && p.LS01?.checkReviewed,
      'Programme switch keeps HF01 + LS01 progress',
      JSON.stringify({ HF01: p.HF01, LS01: !!p.LS01 }),
    )
    const hf01Row = await page.locator('a[href*="units/HF01"]').first().innerText()
    R.ok(
      !/لم يبدأ/.test(hf01Row),
      'Hospitality page shows HF01 as not "not started"',
      hf01Row.replace(/\s+/g, ' '),
    )
    R.ok(db.prefs.lang === 'ar', 'Language remains Arabic', db.prefs.lang)
    R.ok(errs.length === 0, 'No console errors', errs.slice(0, 3).join(' | '))
  } catch (e) {
    R.ok(false, 'Walkthrough B ran to completion', e.message.split('\n')[0])
  }
  await ctx.close()
}

// ---------------------------------------------------------------- Incorrect answer (HF01 A)
{
  const R = reporter('Incorrect')
  all.push(R)
  const { ctx, page } = await newPage()
  try {
    await signIn(page, 'Noor')
    await page.goto(url(unitPath('HF01')))
    await page.getByRole('button', { name: 'Next: question' }).click()
    const radios = page.locator('input[type=radio]')
    await radios.nth(0).check()
    await page.getByRole('button', { name: 'Check answer' }).click()
    await page.waitForTimeout(300)
    R.ok(await visible(page, 'Here is a hint'), 'Hint shown')
    for (const name of ['Replay from the start|Replay', 'Read the lesson', 'Try again']) {
      const n = await page.getByRole('button', { name: new RegExp(`^(${name})$`) }).count()
      R.ok(n > 0, `Offers "${name.split('|').pop()}"`)
    }
    const sel = await page.evaluate(
      () => document.querySelector('input[type=radio]:checked')?.value,
    )
    R.ok(sel === 'A', 'Selection A retained', `checked=${sel}`)
    const txt = await page.locator('main').innerText()
    const bad = txt.match(/\b(wrong|fail(ed|ure)?|incorrect|points?|score|penalt\w*)\b/gi)
    R.ok(!bad, 'No wrong/fail/points wording', bad?.join(','))
    const db = await readDb(page)
    R.ok(
      db.learners.noor.progress.HF01?.checkOutcome === 'incorrect' &&
        !('points' in db.learners.noor),
      'Outcome recorded, no points field',
      JSON.stringify(db.learners.noor.progress.HF01),
    )
    const next = page.getByRole('button', { name: /^Next/ }).first()
    R.ok(await next.isEnabled().catch(() => false), 'Next available after reviewing feedback')
    await next.click()
    await page.waitForURL(/units\/HF02/, { timeout: 5000 }).catch(() => {})
    R.ok(/units\/HF02/.test(page.url()), 'Next goes to HF02', page.url())
  } catch (e) {
    R.ok(false, 'Incorrect-answer flow ran', e.message.split('\n')[0])
  }
  await ctx.close()
}

// ---------------------------------------------------------------- Alternative access
{
  const R = reporter('AltAccess')
  all.push(R)
  const { ctx, page } = await newPage(390)
  try {
    await signIn(page, 'Noor')
    for (const [id, correct] of [
      ['LS02', 'B'],
      ['HF03', null],
    ]) {
      await page.goto(url(unitPath(id)))
      await page.waitForTimeout(300)
      const readMode = page.getByRole('button', { name: 'Read lesson' }).first()
      if (await readMode.isVisible().catch(() => false)) await readMode.click()
      await page.getByRole('button', { name: 'I have read this' }).click()
      await page.getByRole('button', { name: 'Next: question' }).click()
      const ans = correct ?? (await readDb(page), null)
      const radios = page.locator('input[type=radio]')
      if (ans) await page.locator(`input[type=radio][value=${ans}]`).check()
      else await radios.nth(0).check()
      await page.getByRole('button', { name: 'Check answer' }).click()
      await page.waitForTimeout(200)
      const db = await readDb(page)
      const p = db.learners.noor.progress[id]
      R.ok(
        p?.watchedOrRead && p?.checkReviewed,
        `${id} complete via text + buttons only`,
        JSON.stringify(p),
      )
    }
    const m = await page.evaluate(() => window.__media)
    R.ok(
      m.playCalls === 0 && m.playEvents === 0,
      'No media played during text-only completion',
      JSON.stringify(m),
    )
  } catch (e) {
    R.ok(false, 'Alternative-access flow ran', e.message.split('\n')[0])
  }
  await ctx.close()
}

// ---------------------------------------------------------------- Admin data
{
  const R = reporter('Admin')
  all.push(R)
  const { ctx, page, errs } = await newPage()
  try {
    await signIn(page, 'SEDRA admin (demo)')
    await page.goto(url('/admin'))
    await page.waitForTimeout(400)
    const values = await page
      .locator('section[aria-labelledby="ov-totals"] p.text-4xl')
      .allInnerTexts()
    R.ok(values.join('/') === '40/28/12/8/3', 'Overview totals 40/28/12/8/3', values.join('/'))
    await page.goto(url('/admin/learners'))
    const showing = page.locator('p[aria-live="polite"]').first()
    R.ok(
      /Showing 40 of 40/.test(await showing.innerText()),
      'All filter shows 40',
      await showing.innerText(),
    )
    await page.selectOption('#filter-programme', 'life-skills')
    R.ok(
      /Showing 30 of 40/.test(await showing.innerText()),
      'Life Skills filter = 30',
      await showing.innerText(),
    )
    await page.selectOption('#filter-programme', 'hospitality')
    R.ok(
      /Showing 24 of 40/.test(await showing.innerText()),
      'Hospitality filter = 24',
      await showing.innerText(),
    )
    await page.selectOption('#filter-programme', 'both')
    R.ok(
      /Showing 14 of 40/.test(await showing.innerText()),
      'Both filter = 14',
      await showing.innerText(),
    )
    await page.goto(url('/admin/reports'))
    const [dl] = await Promise.all([
      page.waitForEvent('download', { timeout: 5000 }),
      page
        .getByRole('button', { name: /Download|Export/ })
        .first()
        .click(),
    ])
    const file = await dl.path()
    const first = readFileSync(file, 'utf8').replace(/^﻿/, '').split(/\r?\n/)[0]
    R.ok(/^"?Demo data/.test(first), "CSV first line starts 'Demo data'", first)
    // Learner routes must not show admin data.
    await page.goto(url('/learn'))
    await page.waitForTimeout(300)
    const learnerTxt = await page.locator('body').innerText()
    R.ok(!/L-\d\d/.test(learnerTxt), 'Learner dashboard (as admin) shows no admin learner IDs')
    R.ok(errs.length === 0, 'No console errors', errs.slice(0, 3).join(' | '))
  } catch (e) {
    R.ok(false, 'Admin flow ran', e.message.split('\n')[0])
  }
  await ctx.close()
}

// ---------------------------------------------------------------- External resource
{
  const R = reporter('EXT01')
  all.push(R)
  const { ctx, page } = await newPage()
  try {
    await signIn(page, 'Noor')
    await page.goto(url('/resources'))
    await page.waitForTimeout(400)
    const f = await page
      .locator('iframe')
      .first()
      .evaluate((el) => ({
        src: el.getAttribute('src'),
        allow: el.getAttribute('allow') ?? '',
        title: el.getAttribute('title'),
      }))
    R.ok(f.src === 'https://www.youtube.com/embed/gu8gSuF_lvw', 'iframe src exact', f.src)
    R.ok(!/autoplay/i.test(f.src + f.allow), 'No autoplay in src/allow', JSON.stringify(f))
    R.ok(!!f.title, 'iframe has title', f.title)
    const hrefs = await page.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))
    R.ok(
      hrefs.includes('https://youtu.be/gu8gSuF_lvw?si=u4CazJuaYQFaetTl'),
      'Fallback link href exact',
    )
    R.ok(
      await visible(page, 'pending content and accessibility review'),
      "Label 'pending content and accessibility review' visible",
    )
    R.ok(await visible(page, 'Open video on YouTube'), "Fallback label 'Open video on YouTube'")
  } catch (e) {
    R.ok(false, 'EXT01 check ran', e.message.split('\n')[0])
  }
  await ctx.close()
}

// ---------------------------------------------------------------- Keyboard and screen reader
{
  const R = reporter('Keyboard')
  all.push(R)
  const { ctx, page } = await newPage()
  try {
    await signIn(page, 'Noor')
    // Fresh document load (after an in-app route change the Tab start point is past the skip link).
    await page.goto('about:blank')
    await page.goto(url('/learn'))
    await page.waitForTimeout(300)
    await page.keyboard.press('Tab')
    const first = await page.evaluate(() => document.activeElement?.textContent?.trim())
    R.ok(first === 'Skip to main content', 'First Tab stop is Skip to main content', first)
    await page.keyboard.press('Enter')
    const inMain = await page.evaluate(
      () => !!document.activeElement?.closest('main') || document.activeElement?.tagName === 'MAIN',
    )
    R.ok(inMain, 'Skip link moves focus into main')

    // Live region: feedback announced once.
    await page.goto(url(unitPath('LS02')))
    await page.getByRole('button', { name: 'Next: question' }).click()
    await page.evaluate(() => {
      window.__live = []
      const lr = document.querySelector('[aria-live="polite"][aria-atomic="true"]')
      new MutationObserver(() => lr.textContent && window.__live.push(lr.textContent)).observe(lr, {
        childList: true,
        characterData: true,
        subtree: true,
      })
    })
    await page.getByRole('radio', { name: /Think/ }).check()
    await page.getByRole('button', { name: 'Check answer' }).click()
    await page.waitForTimeout(600)
    const live = await page.evaluate(() => window.__live)
    const fb = live.filter((t) => /Think about your choices/.test(t)).length
    R.ok(fb === 1, 'Check feedback announced once in live region', JSON.stringify(live))

    // Leave prompt: unfinished (selected but unchecked) answer; dialog restores focus on Keep learning.
    await page.goto(url(unitPath('LS04')))
    await page.getByRole('button', { name: 'Next: question' }).click()
    await page.locator('input[type=radio]').first().check()
    const home = page.locator('a[href$="#/learn"]').first()
    await home.focus()
    await page.keyboard.press('Enter')
    const dlg = page.getByRole('alertdialog')
    const shown = await dlg.isVisible({ timeout: 2000 }).catch(() => false)
    R.ok(shown, 'Leaving unfinished check opens Keep learning / Leave and save dialog')
    if (shown) {
      const inDialog = await page.evaluate(
        () => !!document.activeElement?.closest('[role=alertdialog]'),
      )
      R.ok(inDialog, 'Focus moves into the dialog')
      await page.getByRole('button', { name: 'Keep learning' }).press('Enter')
      await page.waitForTimeout(300)
      const back = await page.evaluate(() => document.activeElement?.getAttribute('href'))
      R.ok(
        /#\/learn$/.test(back ?? '') && /units\/LS04/.test(page.url()),
        'Keep learning closes dialog, stays, focus returns to opener',
        `focus href=${back} url=${page.url()}`,
      )
    }
  } catch (e) {
    R.ok(false, 'Keyboard flow ran', e.message.split('\n')[0])
  }
  await ctx.close()
}

await browser.close()
const fails = all.flatMap((r) => r.results).filter((r) => !r.pass)
console.log(
  `\nSUMMARY: ${all.flatMap((r) => r.results).length - fails.length} pass, ${fails.length} fail`,
)
process.exit(fails.length ? 1 : 0)
