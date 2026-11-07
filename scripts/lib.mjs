// Shared helpers for the SEDRA mockup checks (hash routing, no auth, localStorage demo db).
// Run against a preview build: bunx --bun vite preview --port 5194 --strictPort
import { readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { chromium } from 'playwright'

export const BASE = (process.env.BASE ?? 'http://127.0.0.1:5194/').replace(/\/?$/, '/')
export const DB_KEY = 'sedra-demo-db'

export const LS_UNITS = ['LS01', 'LS02', 'LS03', 'LS04', 'LS05', 'LS06', 'LS07', 'LS08']
export const HF_UNITS = ['HF01', 'HF02', 'HF03', 'HF04', 'HF05', 'HF06', 'HF07', 'HF08']
export const unitPath = (id) =>
  `/courses/${id.startsWith('LS') ? 'healthy-communication' : 'intro-hospitality'}/units/${id}`

export const url = (path) => `${BASE}#${path}`

function newestHeadlessShell() {
  const root = `${homedir()}/.cache/ms-playwright`
  try {
    const dirs = readdirSync(root)
      .filter((d) => d.startsWith('chromium_headless_shell-'))
      .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
    for (const d of dirs) {
      for (const sub of readdirSync(`${root}/${d}`)) {
        if (sub.startsWith('chrome-')) {
          for (const bin of ['headless_shell', 'chrome-headless-shell']) {
            const p = `${root}/${d}/${sub}/${bin}`
            try {
              if (readdirSync(`${root}/${d}/${sub}`).includes(bin)) return p
            } catch {}
          }
        }
      }
    }
  } catch {}
  return undefined
}

export async function launch() {
  try {
    return await chromium.launch()
  } catch {
    return await chromium.launch({ executablePath: process.env.CHROME ?? newestHeadlessShell() })
  }
}

/** Block third-party requests (YouTube etc.) so they never add noise or hang networkidle. */
export async function blockThirdParty(ctx) {
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (r) => r.abort())
}

/** Collect console errors and page errors on a page. */
export function collectErrors(page) {
  const errs = []
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const t = m.text()
    if (/favicon|ERR_FAILED|net::ERR_|youtube|Failed to load resource/i.test(t)) return
    errs.push(t)
  })
  return errs
}

/** Fresh start: clear storage, sign in via the Welcome persona card (creates the db). */
export async function signIn(page, personaName) {
  await page.goto(url('/welcome'))
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('button', { name: `Continue as ${personaName}` }).click()
  await page.waitForTimeout(300)
}

/** Patch the persisted demo db, then reload so the app re-reads it. */
export async function patchDb(page, fn, { reload = true } = {}) {
  await page.evaluate(
    ([key, src]) => {
      const db = JSON.parse(localStorage.getItem(key))
      // biome-ignore lint: test helper evaluates a serialised function
      const next = new Function('db', `return (${src})(db)`)(db)
      localStorage.setItem(key, JSON.stringify(next))
    },
    [DB_KEY, fn.toString()],
  )
  if (reload) await page.reload()
}

export async function readDb(page) {
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k)), DB_KEY)
}

/** Simple PASS/FAIL reporter. */
export function reporter(name) {
  const results = []
  return {
    ok(cond, label, detail = '') {
      results.push({ pass: !!cond, label, detail })
      console.log(
        `${cond ? 'PASS' : 'FAIL'} [${name}] ${label}${!cond && detail ? ` -- ${detail}` : ''}`,
      )
      return !!cond
    },
    results,
  }
}
