// Admin authoring flows (demo db): edit + save a unit, unpublish the course, new session, invitation, resource.
// Each admin change is checked from the learner side (Noor). PASS/FAIL lines + SUMMARY.
// Usage: node scripts/admin-flows.mjs   (BASE=http://127.0.0.1:5194/ by default)
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
const R = reporter('AdminFlows')
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
await blockThirdParty(ctx)
const page = await ctx.newPage()
const errs = collectErrors(page)

const asPersona = (id) =>
  patchDb(page, new Function('db', `return { ...db, session: { personaId: '${id}' } }`), {
    reload: true,
  })
const bodyText = async () => (await page.locator('main').first().innerText()).replace(/\s+/g, ' ')
const go = async (path) => {
  await page.goto(url(path))
  await page.waitForTimeout(400)
}

const NEW_TITLE = 'Speak kindly, listen well (admin test)'
const SESSION_TITLE = 'Admin test session: Kind words'
const RES_TITLE = 'Admin test resource: Calm phrases'
const INVITEE = 'Mariam Test'

try {
  await signIn(page, 'SEDRA admin')

  // (a) edit LS01 title (EN), save, check the learner side.
  try {
    await go('/admin/content')
    R.ok(/Healthy Communication/.test(await bodyText()), 'Courses list shows Healthy Communication')
    await page
      .getByRole('link', { name: /Open Healthy Communication/ })
      .first()
      .click()
    await page.waitForTimeout(400)
    R.ok(/Course structure/.test(await bodyText()), 'Course builder opens from the list')
    await go('/admin/content/LS01')
    await page.fill('#f-title', NEW_TITLE)
    await page.getByRole('button', { name: 'Save changes', exact: true }).click()
    await page.waitForTimeout(400)
    const db = await readDb(page)
    R.ok(
      db.unitEdits?.LS01?.unit?.title?.en === NEW_TITLE && db.unitEdits.LS01.published === true,
      'Save changes writes unitEdits.LS01',
      JSON.stringify(db.unitEdits?.LS01?.unit?.title),
    )
    R.ok(
      db.unitEdits.LS01.unit.title.ar.length > 0 && db.unitEdits.LS01.unit.title.ar !== NEW_TITLE,
      'Arabic title kept from current unit',
    )
    R.ok(
      await page
        .getByText('Learners see the change in this demo', { exact: false })
        .first()
        .isVisible()
        .catch(() => false),
      "Toast 'Learners see the change in this demo'",
    )
    await asPersona('noor')
    await go('/programmes/life-skills')
    R.ok((await bodyText()).includes(NEW_TITLE), 'Learner programme page shows the new LS01 title')
    await go(unitPath('LS01'))
    R.ok((await bodyText()).includes(NEW_TITLE), 'Learner LS01 unit page shows the new title')
  } catch (e) {
    R.ok(false, '(a) edit + save flow ran', e.message.split('\n')[0])
  }

  // (b) publishing is per course: unpublish Healthy Communication, check learners, publish again.
  try {
    await asPersona('admin')
    await go('/admin/courses/healthy-communication')
    const ls03Title = (await page.locator('#bu-LS03').innerText()).trim()
    await page.getByRole('button', { name: 'Unpublish course' }).click()
    await page.waitForTimeout(300)
    let db = await readDb(page)
    R.ok(
      db.courseUnpublished?.['healthy-communication'] === true,
      'Unpublish writes courseUnpublished[healthy-communication]=true',
    )
    R.ok(
      await page.getByRole('button', { name: 'Publish course' }).isVisible(),
      'Builder shows Publish course after unpublishing',
    )
    await asPersona('noor')
    await go(unitPath('LS03'))
    const unitTxt = await bodyText()
    R.ok(
      /unavailable|not available|not published|isn't available|is not open/i.test(unitTxt) ||
        !unitTxt.includes(ls03Title),
      'Learner LS03 unit page is unavailable while the course is unpublished',
      unitTxt.slice(0, 160),
    )
    await asPersona('admin')
    await go('/admin/courses/healthy-communication')
    await page.getByRole('button', { name: 'Publish course' }).click()
    await page.waitForTimeout(300)
    db = await readDb(page)
    R.ok(
      !db.courseUnpublished?.['healthy-communication'],
      'Publish course makes it visible again',
    )
  } catch (e) {
    R.ok(false, '(b) course unpublish flow ran', e.message.split('\n')[0])
  }

  // (c) create a session, check learner /sessions.
  try {
    await asPersona('admin')
    await go('/admin/sessions')
    const before = (await readDb(page)).sessions.length
    await page.getByRole('button', { name: 'New session' }).click()
    await page.fill('#s-titleEn', SESSION_TITLE)
    await page.fill('#s-titleAr', 'جلسة تجريبية: كلمات لطيفة')
    await page.fill('#s-date', '2026-12-01')
    await page.fill('#s-time', '16:00')
    await page.fill('#s-accessLink', 'https://zoom.us/j/demo-admin-test')
    await page.getByRole('button', { name: 'Create session (demo)' }).click()
    await page.waitForTimeout(300)
    const db = await readDb(page)
    const s = db.sessions.find((x) => x.title.en === SESSION_TITLE)
    R.ok(
      db.sessions.length === before + 1 &&
        s?.demo === true &&
        s.recordingStatus === 'pending' &&
        s.attendanceStatus === 'upcoming',
      'New session saved (demo, upcoming, pending recording)',
    )
    // Cancel + restore on the seeded Hospitality session.
    await page.getByRole('button', { name: /^Cancel session: Hospitality/ }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel session' }).click()
    await page.waitForTimeout(300)
    R.ok(
      (await readDb(page)).sessions.find((x) => x.id === 'ses-hf-upcoming')?.cancelled === true,
      'Cancel session (with confirm) sets cancelled',
    )
    const restore = page.getByRole('button', { name: /^Restore session: Hospitality/ })
    R.ok(await restore.isVisible(), 'Restore button shown for the cancelled session')
    await asPersona('noor')
    await go('/sessions')
    R.ok((await bodyText()).includes(SESSION_TITLE), 'Learner /sessions shows the new session')
  } catch (e) {
    R.ok(false, '(c) session flow ran', e.message.split('\n')[0])
  }

  // (d) invitation: validation, create, pending list.
  try {
    await asPersona('admin')
    await go('/admin/learners')
    await page.getByRole('button', { name: 'Invite learner' }).click()
    await page.getByRole('button', { name: 'Create invitation (demo)' }).click()
    await page.waitForTimeout(200)
    const dlg = page.getByRole('dialog')
    R.ok(
      /Choose at least one programme/.test(await dlg.innerText()),
      'Invite form shows plain errors (programme required)',
    )
    await page.fill('#inv-name', INVITEE)
    await page.fill('#inv-email', 'mariam@example.com')
    await page.check('#inv-prog-hospitality')
    await page.getByRole('button', { name: 'Create invitation (demo)' }).click()
    await page.waitForTimeout(300)
    R.ok(
      /Invitation ready \(demo\)\. No email was sent\./.test(await dlg.innerText()),
      "Success panel 'Invitation ready (demo). No email was sent.'",
    )
    R.ok(
      await dlg.getByRole('button', { name: 'Open invitation link (demo)' }).isVisible(),
      'Open invitation link (demo) button shown',
    )
    await dlg.getByRole('button', { name: 'Done' }).click()
    await page.waitForTimeout(300)
    const focusedText = await page.evaluate(() => document.activeElement?.textContent ?? '')
    R.ok(/Invite learner/.test(focusedText), 'Focus returns to Invite learner after the dialog')
    const list = await page.locator('section[aria-labelledby="inv-list-h"]').innerText()
    R.ok(list.includes(INVITEE) && /Pending/.test(list), 'Invitation listed as Pending')
    const db = await readDb(page)
    R.ok(
      db.invitations[0]?.status === 'pending' &&
        db.invitations[0]?.programmes.join() === 'hospitality',
      'db.invitations has the pending invitation',
    )
    // Illustrative totals unchanged.
    R.ok(
      /Showing 40 of 40/.test(await page.locator('p[aria-live="polite"]').first().innerText()),
      'Learner table still shows 40 of 40',
    )
    // Open link navigates to /welcome?invite=<id>.
    await page
      .locator('section[aria-labelledby="inv-list-h"]')
      .getByRole('button', { name: new RegExp(`Open invitation link for ${INVITEE}`) })
      .click()
    await page.waitForTimeout(300)
    R.ok(
      page.url().includes(`#/welcome?invite=${db.invitations[0].id}`),
      'Open link goes to #/welcome?invite=<id>',
      page.url(),
    )
  } catch (e) {
    R.ok(false, '(d) invitation flow ran', e.message.split('\n')[0])
  }

  // (e) custom resource, check learner /resources.
  try {
    await asPersona('admin')
    await go('/admin/resources')
    await page.getByRole('button', { name: 'Add resource' }).click()
    await page.fill('#cr-titleEn', RES_TITLE)
    await page.fill('#cr-titleAr', 'مصدر تجريبي: عبارات هادئة')
    await page.fill('#cr-bodyEn', 'Three calm phrases to use when you feel upset.')
    await page.fill('#cr-bodyAr', 'ثلاث عبارات هادئة تستخدمها عندما تشعر بالانزعاج.')
    await page.fill('#cr-url', 'http://not-secure.example')
    await page.getByRole('button', { name: 'Save resource (demo)' }).click()
    await page.waitForTimeout(200)
    R.ok(
      /starts with https:\/\//.test(await page.getByRole('dialog').innerText()),
      'Resource link must be https',
    )
    await page.fill('#cr-url', 'https://example.org/calm')
    await page.getByRole('button', { name: 'Save resource (demo)' }).click()
    await page.waitForTimeout(300)
    const db = await readDb(page)
    R.ok(
      db.customResources.some(
        (r) => r.title.en === RES_TITLE && r.url === 'https://example.org/calm',
      ),
      'db.customResources has the new resource',
    )
    await asPersona('noor')
    await go('/resources')
    R.ok((await bodyText()).includes(RES_TITLE), 'Learner /resources shows the custom resource')
  } catch (e) {
    R.ok(false, '(e) resource flow ran', e.message.split('\n')[0])
  }

  // Layout: no horizontal scroll at 390 px on admin pages.
  try {
    await asPersona('admin')
    await page.setViewportSize({ width: 390, height: 844 })
    for (const p of [
      '/admin/content',
      '/admin/courses/healthy-communication',
      '/admin/content/LS01',
      '/admin/learners',
      '/admin/sessions',
      '/admin/resources',
    ]) {
      await go(p)
      const over = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      R.ok(over <= 0, `No horizontal scroll at 390 px: ${p}`, `overflow ${over}px`)
    }
  } catch (e) {
    R.ok(false, 'Layout check ran', e.message.split('\n')[0])
  }

  R.ok(errs.length === 0, 'No console errors', errs.slice(0, 3).join(' | '))
} catch (e) {
  R.ok(false, 'Admin flows ran', e.message.split('\n')[0])
}

await browser.close()
const failed = R.results.filter((r) => !r.pass)
console.log(`\nSUMMARY: ${R.results.length - failed.length}/${R.results.length} passed`)
process.exit(failed.length ? 1 : 0)
