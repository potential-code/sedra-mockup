// Screenshot helper: node scripts/shot.mjs <persona|none> <path> <width> <lang> <out.png>
import { BASE, DB_KEY, launch, url } from './lib.mjs'

const [persona = 'none', path = '/', width = '1440', lang = 'en', out = 'shot.png'] =
  process.argv.slice(2)
const browser = await launch()
const page = await browser.newPage({ viewport: { width: +width, height: 900 } })
await page.goto(BASE)
await page.evaluate(
  ([key, persona, lang]) => {
    const raw = localStorage.getItem(key)
    const db = raw ? JSON.parse(raw) : null
    if (!db) return
    db.session.personaId = persona === 'none' ? null : persona
    db.prefs.lang = lang
    localStorage.setItem(key, JSON.stringify(db))
  },
  [DB_KEY, persona, lang],
)
await page.goto(url(path))
await page.reload()
await page.waitForTimeout(1200)
await page.screenshot({ path: out, fullPage: process.env.FULL === '1' })
await browser.close()
console.log(out)
