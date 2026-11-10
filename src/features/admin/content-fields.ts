import type { Lang, Unit } from '@shared/types'

/**
 * Content editor schema (brief §9 Admin content and reporting). `options` is edited as three
 * fields (options_A..C) so each answer has its own label; together they are the `options` field.
 */
export const FIELD_KEYS = [
  'programme_id',
  'course_id',
  'unit_id',
  'order',
  'language',
  'title',
  'objective',
  'source_pages',
  'video_url',
  'duration_seconds',
  'captions_url',
  'transcript',
  'summary',
  'image_alt',
  'question',
  'options_A',
  'options_B',
  'options_C',
  'correct_option',
  'feedback_correct',
  'feedback_retry',
  'practice_prompt',
  'practice_choices',
  'practice_multiple',
  'media_status',
  'review_status',
] as const

export type FieldKey = (typeof FIELD_KEYS)[number]

/** Order the fields appear in the editor (error summary follows it). */
export const SCREEN_ORDER: FieldKey[] = [
  'language',
  'programme_id',
  'course_id',
  'unit_id',
  'order',
  'title',
  'objective',
  'source_pages',
  'summary',
  'video_url',
  'duration_seconds',
  'captions_url',
  'media_status',
  'transcript',
  'image_alt',
  'question',
  'options_A',
  'options_B',
  'options_C',
  'correct_option',
  'feedback_correct',
  'feedback_retry',
  'practice_prompt',
  'practice_choices',
  'practice_multiple',
  'review_status',
]
export type Fields = Record<FieldKey, string>

export const REVIEW_STATUSES = ['draft', 'in-review', 'approved'] as const
export type ReviewStatus = (typeof REVIEW_STATUSES)[number]

/** Prefill a draft from the loaded unit content for one language. */
export function fieldsFromUnit(unit: Unit, lang: Lang): Fields {
  const media = lang === 'en' ? unit.media?.en : undefined
  const opt = (id: 'A' | 'B' | 'C') => unit.check.options.find((o) => o.id === id)?.text[lang] ?? ''
  return {
    programme_id: unit.programmeId,
    course_id: unit.courseId,
    unit_id: unit.id,
    order: String(unit.order),
    language: lang,
    title: unit.title[lang],
    objective: unit.objective[lang],
    source_pages: unit.sourcePages,
    video_url: media?.video ?? '',
    duration_seconds: String(unit.durationSeconds),
    captions_url: media?.captions ?? '',
    transcript: unit.scenes.map((s) => s.narration[lang]).join('\n'),
    summary: unit.summary[lang],
    image_alt: unit.imageAlt[lang],
    question: unit.check.question[lang],
    options_A: opt('A'),
    options_B: opt('B'),
    options_C: opt('C'),
    correct_option: unit.check.correct,
    feedback_correct: unit.check.feedbackCorrect[lang],
    feedback_retry: unit.check.feedbackRetry[lang],
    practice_prompt: unit.practice.prompt[lang],
    // One answer choice per line; empty means Done / Later / With help buttons only.
    practice_choices: (unit.practice.choices ?? []).map((c) => c[lang]).join('\n'),
    practice_multiple: unit.practice.multiple ? 'yes' : 'no',
    // Only English sample videos exist (LS02, HF01); Arabic drafts show the pending panel.
    media_status: media ? 'sample' : 'pending',
    review_status: 'draft',
  }
}

/** Error message keys in the admin namespace, per field. */
export type FieldErrors = Partial<Record<FieldKey, string>>

function fileName(url: string): string {
  return url.split(/[?#]/)[0]?.split('/').pop() ?? ''
}

/** Validation before "Publish (demo)" (brief §9). Returns i18n keys, empty when valid. */
export function validateForPublish(f: Fields): FieldErrors {
  const raw = collectErrors(f)
  // Report errors in on-screen field order so the summary reads top to bottom.
  const ordered: FieldErrors = {}
  for (const k of SCREEN_ORDER) if (raw[k]) ordered[k] = raw[k]
  return ordered
}

function collectErrors(f: Fields): FieldErrors {
  const e: FieldErrors = {}
  const blank = (k: FieldKey) => f[k].trim() === ''
  if (blank('title')) e.title = 'editor.errors.title'
  if (f.language !== 'en' && f.language !== 'ar') e.language = 'editor.errors.language'
  if (blank('summary')) e.summary = 'editor.errors.summary'
  if (blank('question')) e.question = 'editor.errors.question'
  for (const k of ['options_A', 'options_B', 'options_C'] as const) {
    if (blank(k)) e[k] = 'editor.errors.option'
  }
  if (!['A', 'B', 'C'].includes(f.correct_option)) e.correct_option = 'editor.errors.correct'
  // Owner decision: both feedback messages are part of a complete check, so publishing needs them.
  if (blank('feedback_correct')) e.feedback_correct = 'editor.errors.feedbackCorrect'
  if (blank('feedback_retry')) e.feedback_retry = 'editor.errors.feedbackRetry'
  if (blank('image_alt')) e.image_alt = 'editor.errors.imageAlt'
  if (blank('transcript')) e.transcript = 'editor.errors.transcript'
  // Short videos: any length up to two minutes (LS02 v4 is 19 s; no longer fixed at 30).
  const secs = Number(f.duration_seconds.trim())
  if (!Number.isFinite(secs) || secs <= 0 || secs > 120)
    e.duration_seconds = 'editor.errors.duration'
  const id = f.unit_id.toUpperCase()
  for (const k of ['video_url', 'captions_url'] as const) {
    if (!blank(k) && !fileName(f[k]).toUpperCase().includes(id)) e[k] = 'editor.errors.assetId'
  }
  if (f.media_status === 'sample' && blank('video_url'))
    e.video_url = 'editor.errors.sampleNeedsVideo'
  return e
}
