// axe-core full run (wcag2a, wcag2aa, wcag21aa) on key pages in EN, AR and high-contrast pref.
// Usage: node scripts/contrast.mjs   env: BASE, WIDTH=1280
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { blockThirdParty, launch, signIn, unitPath, url } from './lib.mjs'

const require = createRequire(import.meta.url)
const axeSrc = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')

const PAGES = [
  [null, '/'],
  [null, '/welcome'],
  ['Noor', '/learn'],
  ['Noor', '/preferences'],
  ['Noor', '/programmes/life-skills'],
  ['Noor', unitPath('LS02')],
  ['Noor', `${unitPath('LS02')}#check`],
  ['Noor', unitPath('HF01')],
  ['Noor', unitPath('LS04')],
  ['Noor', '/sessions'],
  ['Noor', '/resources'],
  ['Noor', '/achievements'],
  ['Noor', '/help'],
  ['SEDRA admin', '/admin'],
  ['SEDRA admin', '/admin/learners'],
  ['SEDRA admin', '/admin/content/LS02'],
  ['SEDRA admin', '/admin/reports'],
]
const VARIANTS = [
  { name: 'EN', lang: 'en', contrast: 'standard' },
  { name: 'AR', lang: 'ar', contrast: 'standard' },
  { name: 'EN-high', lang: 'en', contrast: 'high' },
]
const width = Number(process.env.WIDTH ?? 1280)
const browser = await launch()
const byRule = new Map()
let total = 0

for (const v of VARIANTS) {
  for (const persona of [null, 'Noor', 'SEDRA admin']) {
    const pages = PAGES.filter(([p]) => p === persona)
    const ctx = await browser.newContext({ viewport: { width, height: 900 } })
    await blockThirdParty(ctx)
    const page = await ctx.newPage()
    await signIn(page, persona ?? 'Noor')
    await page.evaluate(
      ([persona, lang, contrast]) => {
        const db = JSON.parse(localStorage.getItem('sedra-demo-db'))
        db.prefs = { ...db.prefs, lang, contrast }
        if (!persona) db.session = { personaId: null }
        localStorage.setItem('sedra-demo-db', JSON.stringify(db))
      },
      [persona, v.lang, v.contrast],
    )
    for (const [, route0] of pages) {
      const [route, step] = route0.split('#')
      await page.goto('about:blank')
      await page.goto(url(route), { waitUntil: 'networkidle' })
      await page.waitForTimeout(400)
      if (step === 'check') {
        // Open the question step and show a hint (incorrect answer) so feedback colours are audited.
        await page.locator('nav[aria-label] ol button').nth(1).click()
        await page.locator('input[type=radio]').first().check()
        await page.locator('button[type=submit]').click()
        await page.waitForTimeout(300)
      }
      await page.addScriptTag({ content: axeSrc })
      const res = await page.evaluate(async () => {
        // biome-ignore lint: axe is injected globally
        const r = await window.axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
          resultTypes: ['violations'],
        })
        return r.violations.map((x) => ({
          id: x.id,
          impact: x.impact,
          help: x.help,
          nodes: x.nodes.map((n) => ({
            target: n.target.join(' '),
            summary: (n.any[0]?.message ?? n.failureSummary ?? '').slice(0, 160),
          })),
        }))
      })
      for (const viol of res) {
        const cur = byRule.get(viol.id) ?? { impact: viol.impact, help: viol.help, hits: [] }
        for (const n of viol.nodes) {
          cur.hits.push({ where: `${v.name} ${route0}`, target: n.target, summary: n.summary })
          total++
        }
        byRule.set(viol.id, cur)
      }
    }
    await ctx.close()
  }
}
await browser.close()

const order = { critical: 0, serious: 1, moderate: 2, minor: 3 }
console.log(`=== axe (wcag2a/2aa/21aa) @${width}px: ${byRule.size} rules, ${total} nodes ===`)
for (const [id, r] of [...byRule].sort((a, b) => order[a[1].impact] - order[b[1].impact])) {
  console.log(`\nFAIL ${id} [${r.impact}] ${r.help} — ${r.hits.length} nodes`)
  const seen = new Map()
  for (const h of r.hits) {
    const k = `${h.target} :: ${h.summary}`
    seen.set(k, [...(seen.get(k) ?? []), h.where])
  }
  for (const [k, w] of [...seen].slice(0, 10))
    console.log(
      `   ${k}\n      on: ${w.slice(0, 4).join(', ')}${w.length > 4 ? ` +${w.length - 4}` : ''}`,
    )
  if (seen.size > 10) console.log(`   ... ${seen.size - 10} more distinct`)
}
if (!byRule.size) console.log('PASS no axe violations')
process.exit(byRule.size ? 1 : 0)
