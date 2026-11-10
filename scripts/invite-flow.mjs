// Learner invitation + enrolled-only checks. Prints PASS/FAIL lines; exit code 1 on any FAIL.
// Usage: node scripts/invite-flow.mjs   (BASE=http://127.0.0.1:5194/ by default)
import { blockThirdParty, collectErrors, launch, patchDb, readDb, reporter, url } from './lib.mjs'

const browser = await launch()
const all = []

async function newPage(width = 1280) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } })
  await blockThirdParty(ctx)
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

const INVITE = {
  id: 'inv-flowtest',
  name: 'Sara Test',
  email: 'sara.test@example.com',
  lang: 'en',
  programmes: ['hospitality'],
  status: 'pending',
  createdAt: '2026-11-09T08:00:00.000Z',
}

// ---------------------------------------------------------------- Invitation accept flow
{
  const R = reporter('Invite')
  all.push(R)
  const { ctx, page, errs } = await newPage()
  try {
    // Fresh demo db, then add an invitation directly (as Admin would).
    await page.goto(url('/welcome'))
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.waitForTimeout(200)
    await patchDb(
      page,
      new Function('db', `db.invitations = [${JSON.stringify(INVITE)}]; return db`),
    )

    await page.goto(url(`/welcome?invite=${INVITE.id}`))
    await page.waitForTimeout(300)
    R.ok(
      await page.getByRole('heading', { name: 'Accept your invitation' }).isVisible(),
      'Accept card shown',
    )
    R.ok(await visible(page, 'Hello Sara Test.'), 'Greets invited learner by name')
    const chips = await page.getByRole('list', { name: 'Your programmes' }).innerText()
    R.ok(
      /Hospitality for All/.test(chips) && !/Life Skills/.test(chips),
      'Programme chip: Hospitality for All only',
      chips,
    )
    R.ok(await visible(page, INVITE.email), 'Invited email shown')
    const personas = await page.getByRole('button', { name: /^Continue as/ }).count()
    R.ok(personas === 0, 'Persona list replaced by the accept card', `count=${personas}`)

    // Mismatched passwords: error shown, text preserved.
    const pw = page.getByLabel('Create a password')
    const confirm = page.getByLabel('Type the password again')
    await pw.fill('garden2026')
    await confirm.fill('garden2027')
    await page.getByRole('button', { name: 'Accept invitation' }).click()
    await page.waitForTimeout(300)
    R.ok(
      await visible(page, 'The two passwords are not the same'),
      'Mismatch error shown in plain language',
    )
    R.ok(await page.getByRole('alert').isVisible(), 'Error summary shown')
    R.ok(
      (await pw.inputValue()) === 'garden2026' && (await confirm.inputValue()) === 'garden2027',
      'Entered text preserved',
    )
    R.ok(
      (await confirm.getAttribute('aria-invalid')) === 'true',
      'Confirm field marked aria-invalid',
    )
    R.ok(/welcome/.test(page.url()), 'Still on Welcome after error', page.url())

    // Password reveal toggles both fields.
    await page.getByRole('button', { name: 'Show passwords' }).click()
    R.ok((await pw.getAttribute('type')) === 'text', 'Password reveal works')

    // Valid: lands on /preferences.
    await confirm.fill('garden2026')
    await page.getByRole('button', { name: 'Accept invitation' }).click()
    await page.waitForURL(/#\/preferences/, { timeout: 5000 }).catch(() => {})
    R.ok(/#\/preferences/.test(page.url()), 'Accept goes to Preferences', page.url())
    let db = await readDb(page)
    const nl = db.learners['new-learner']
    R.ok(
      db.session.personaId === 'new-learner' &&
        nl.displayName === 'Sara Test' &&
        JSON.stringify(nl.enrolled) === '["hospitality"]' &&
        db.invitations[0].status === 'accepted',
      'Invitation accepted and learner enrolled in Hospitality only',
      JSON.stringify({ s: db.session, nl, st: db.invitations[0].status }),
    )

    await page.getByRole('button', { name: 'Save and continue' }).click()
    await page.waitForURL(/#\/learn$/, { timeout: 5000 }).catch(() => {})
    R.ok(/#\/learn$/.test(page.url()), 'Save and continue opens dashboard', page.url())
    await page.waitForTimeout(300)
    R.ok(
      await page.getByRole('heading', { name: 'Choose where to start' }).isVisible(),
      "First-time dashboard: 'Choose where to start'",
    )
    R.ok(await visible(page, 'Welcome, Sara Test.'), 'Dashboard greets Sara Test')
    R.ok(
      await visible(page, 'SEDRA has enrolled you in 1 programme.'),
      'Dashboard states enrolment count',
    )
    const main = await page.locator('main').innerText()
    R.ok(
      /Hospitality for All/.test(main) && !/Life Skills/.test(main),
      'Dashboard shows only Hospitality for All',
    )
    R.ok(
      (await page.getByRole('link', { name: 'Continue learning' }).count()) === 0,
      'No Continue learning card on first visit',
    )
    const learnHref = await page
      .getByRole('navigation')
      .getByRole('link', { name: 'Learn' })
      .first()
      .getAttribute('href')
    // Learn and the course card open the unit view directly; it carries the course menu.
    R.ok(
      /courses\/intro-hospitality\/units\/HF01/.test(learnHref ?? ''),
      'Learn nav opens Hospitality unit 1',
      learnHref,
    )

    await page.getByRole('link', { name: 'Start Hospitality for All' }).click()
    await page.waitForURL(/units\/HF01/, { timeout: 5000 }).catch(() => {})
    R.ok(/units\/HF01/.test(page.url()), 'Start opens Hospitality unit 1', page.url())
    R.ok(
      await page
        .getByRole('heading', { name: /^Units$/ })
        .waitFor({ timeout: 5000 })
        .then(() => true)
        .catch(() => false),
      'Unit view shows the course outline (units menu)',
    )
    R.ok(
      (await page.locator('a[href*="courses/healthy-communication/"]').count()) === 0,
      'Unit view offers no Life Skills links to a Hospitality-only learner',
    )

    // Non-enrolled programme for the invited learner.
    await page.goto(url('/programmes/life-skills'))
    await page.waitForTimeout(300)
    R.ok(
      await visible(page, 'SEDRA manages enrolment'),
      'Life Skills shows not-enrolled message for invited learner',
    )

    // The used link now shows a friendly message and normal sign-in.
    await page.goto(url(`/welcome?invite=${INVITE.id}`))
    await page.waitForTimeout(300)
    R.ok(await visible(page, 'This invitation was already accepted'), 'Used invitation message')
    R.ok(
      (await page.getByRole('button', { name: /^Continue as/ }).count()) > 0,
      'Used invitation: normal sign-in shown',
    )
    await page.goto(url('/welcome?invite=inv-nope'))
    await page.waitForTimeout(300)
    R.ok(await visible(page, 'We could not find this invitation'), 'Unknown invitation message')
    await page.goto(url('/welcome'))
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'I have an invitation link' }).click()
    R.ok(
      await visible(page, 'SEDRA sends you an invitation link by email'),
      'Invitation link disclosure explains the demo',
    )
    db = await readDb(page)
    R.ok(errs.length === 0, 'No console errors', errs.slice(0, 3).join(' | '))
  } catch (e) {
    R.ok(false, 'Invitation flow ran to completion', e.message.split('\n')[0])
  }
  await ctx.close()
}

// ---------------------------------------------------------------- Noor enrolled in Life Skills only
{
  const R = reporter('Enrolled')
  all.push(R)
  const { ctx, page, errs } = await newPage()
  try {
    await page.goto(url('/welcome'))
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.getByRole('button', { name: 'Continue as Noor' }).click()
    await page.waitForTimeout(300)
    await patchDb(page, (db) => {
      db.learners.noor.enrolled = ['life-skills']
      db.sessions[0].cancelled = true
      db.customResources = [
        {
          id: 'res-flowtest',
          courseId: 'healthy-communication',
          title: { en: 'Flow test resource card', ar: 'بطاقة اختبار' },
          body: { en: 'A short text from SEDRA.', ar: 'نص قصير من سدرة.' },
          url: 'https://example.com/guide',
          createdAt: '2026-11-09T08:00:00.000Z',
        },
      ]
      return db
    })
    await page.goto(url('/learn'))
    await page.waitForTimeout(300)
    const main = await page.locator('main').innerText()
    R.ok(!/Hospitality for All/.test(main), 'Noor dashboard hides Hospitality for All')
    R.ok(/Life Skills/.test(main), 'Noor dashboard shows Life Skills')
    R.ok(
      (await page.getByRole('link', { name: 'Continue learning' }).count()) > 0,
      'Returning layout keeps Continue learning',
    )

    await page.goto(url('/programmes/hospitality'))
    await page.waitForTimeout(300)
    R.ok(
      await page
        .getByRole('heading', { name: 'You are not enrolled in this programme' })
        .isVisible(),
      '/programmes/hospitality shows not-enrolled heading',
    )
    R.ok(await visible(page, 'SEDRA manages enrolment.'), 'Not-enrolled message names SEDRA')
    R.ok(
      await page.getByRole('link', { name: 'Back to my learning' }).isVisible(),
      'Not-enrolled page links back to dashboard',
    )
    await page.goto(url('/courses/intro-hospitality/units/HF01'))
    await page.waitForTimeout(300)
    R.ok(await visible(page, 'SEDRA manages enrolment.'), 'HF01 unit shows not-enrolled message')

    await page.goto(url('/sessions'))
    await page.waitForTimeout(300)
    const ses = await page.locator('main').innerText()
    R.ok(!/Hospitality live session/.test(ses), 'Sessions hide Hospitality sessions')
    R.ok(await visible(page, 'Cancelled'), 'Cancelled session shows Cancelled chip')
    R.ok(
      (await page.getByRole('button', { name: /^Join session/ }).count()) === 0,
      'Cancelled session has no Join',
    )

    await page.goto(url('/resources'))
    await page.waitForTimeout(300)
    R.ok(await visible(page, 'Flow test resource card'), 'Custom resource card shown')
    R.ok(await visible(page, 'Opens in a new tab'), "Custom link says 'Opens in a new tab'")
    const resMain = await page.locator('main').innerText()
    R.ok(!/Introduction to Hospitality/.test(resMain), 'Resources hide Hospitality section')

    await page.goto(url('/achievements'))
    await page.waitForTimeout(300)
    const ach = await page.locator('main').innerText()
    R.ok(!/Hospitality for All/.test(ach), 'Achievements hide Hospitality')
    R.ok(errs.length === 0, 'No console errors', errs.slice(0, 3).join(' | '))
  } catch (e) {
    R.ok(false, 'Enrolled-only flow ran to completion', e.message.split('\n')[0])
  }
  await ctx.close()
}

await browser.close()
const fails = all.flatMap((r) => r.results).filter((r) => !r.pass)
console.log(
  `\nSUMMARY: ${all.flatMap((r) => r.results).length - fails.length} pass, ${fails.length} fail`,
)
process.exit(fails.length ? 1 : 0)
