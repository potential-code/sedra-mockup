// Media checks: ffprobe duration (short: 5-120 s), VTT parses (and ends within the video), captions <track default>
// follows prefs.captions. Usage: node scripts/media.mjs
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { blockThirdParty, launch, patchDb, reporter, signIn, unitPath, url } from './lib.mjs'

const R = reporter('Media')
const root = new URL('../public/media/', import.meta.url).pathname

const toSec = (t) => {
  const p = t.split(':').map(Number)
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]
}

for (const unit of readdirSync(root)) {
  const dir = join(root, unit)
  const files = readdirSync(dir)
  for (const f of files.filter((f) => /^SEDRA_.*_clean\.mp4$/.test(f))) {
    const d = Number(
      execFileSync('ffprobe', [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'csv=p=0',
        join(dir, f),
      ])
        .toString()
        .trim(),
    )
    R.ok(d >= 5 && d <= 120, `${f} short video (5-120 s)`, `${d}s`)
  }
  for (const f of files.filter((f) => f.endsWith('.vtt'))) {
    const txt = readFileSync(join(dir, f), 'utf8').replace(/^﻿/, '')
    const errors = []
    if (!/^WEBVTT/.test(txt)) errors.push('missing WEBVTT header')
    const cues = [
      ...txt.matchAll(
        /^(\d{1,2}:)?(\d{2}:\d{2}\.\d{3}) --> ((\d{1,2}:)?\d{2}:\d{2}\.\d{3})(.*)$/gm,
      ),
    ]
    let last = -1
    let maxEnd = 0
    for (const c of cues) {
      const s = toSec((c[1] ?? '') + c[2])
      const e = toSec(c[3])
      if (e <= s) errors.push(`cue end<=start at ${c[2]}`)
      if (s < last) errors.push(`cue out of order at ${c[2]}`)
      last = s
      maxEnd = Math.max(maxEnd, e)
    }
    const arrowLines = (txt.match(/-->/g) ?? []).length
    if (arrowLines !== cues.length)
      errors.push(`${arrowLines - cues.length} malformed timing lines`)
    if (!cues.length) errors.push('no cues')
    if (maxEnd > 120.05) errors.push(`last cue ends ${maxEnd}s > 120s`)
    R.ok(!errors.length, `${f} parses (${cues.length} cues, ends ${maxEnd}s)`, errors.join('; '))
  }
}

const browser = await launch()
for (const captions of [true, false]) {
  const ctx = await browser.newContext()
  await blockThirdParty(ctx)
  const page = await ctx.newPage()
  await signIn(page, 'Noor')
  await patchDb(
    page,
    new Function(
      `return (db) => ({ ...db, prefs: { ...db.prefs, lang: 'en', captions: ${captions} } })`,
    )(),
  )
  for (const id of ['LS02', 'HF01']) {
    await page.goto(url(unitPath(id)))
    await page.locator('video').waitFor()
    await page.waitForTimeout(500)
    const t = await page.evaluate(() => {
      const tr = document.querySelector('video track')
      const v = document.querySelector('video')
      return {
        track: !!tr,
        kind: tr?.kind,
        srclang: tr?.srclang,
        def: tr?.hasAttribute('default'),
        src: tr?.getAttribute('src'),
        mode: v.textTracks[0]?.mode,
        paused: v.paused,
        autoplay: v.hasAttribute('autoplay'),
      }
    })
    if (captions)
      R.ok(
        t.track && t.kind === 'captions' && t.def && t.mode === 'showing',
        `${id} captions on: <track kind=captions default> showing`,
        JSON.stringify(t),
      )
    else
      R.ok(
        t.track && !t.def && t.mode !== 'showing',
        `${id} captions off: track not default/showing`,
        JSON.stringify(t),
      )
    R.ok(t.paused && !t.autoplay, `${id} no autoplay`, JSON.stringify(t))
    const ok = await page.evaluate(async (src) => (await fetch(src)).ok, t.src)
    R.ok(ok, `${id} caption file served`, t.src)
  }
  await ctx.close()
}
await browser.close()
const fails = R.results.filter((r) => !r.pass).length
console.log(`\nSUMMARY: ${R.results.length - fails} pass, ${fails} fail`)
process.exit(fails ? 1 : 0)
