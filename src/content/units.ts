import type {
  CourseId,
  KnowledgeCheck,
  Localized,
  OptionId,
  ProgrammeId,
  Scene,
  Unit,
  UnitId,
  VideoAsset,
} from '@shared/types'

/**
 * 16 units from the brief §5 (docs/brief.txt).
 * English is the verbatim content-entry master: do not edit it here without the brief.
 * Arabic is a simple Modern Standard Arabic DRAFT for SEDRA review. LS02 and HF01 Arabic
 * narration and on-screen labels are the brief's suggested Arabic (§7, §8).
 */

const TIMES = ['0–7.5 s', '7.5–15 s', '15–22.5 s', '22.5–30 s'] as const

/** [narration en, narration ar, on-screen en, on-screen ar, visual en, visual ar] */
type SceneRow = [string, string, string, string, string, string]

const RETRY_EN = 'You can replay, read the lesson, try again or continue with support.'
const RETRY_AR = 'يمكنك إعادة المشاهدة أو قراءة الدرس أو المحاولة مرة أخرى أو المتابعة مع الدعم.'

const l = (en: string, ar: string): Localized => ({ en, ar })

/** Exactly four 7.5-second scenes per unit (brief §5). */
function scenes(rows: [SceneRow, SceneRow, SceneRow, SceneRow]): Scene[] {
  return TIMES.map((time, i) => {
    const r = rows[i as 0 | 1 | 2 | 3]
    return {
      time,
      narration: l(r[0], r[1]),
      onScreen: l(r[2], r[3]),
      visual: l(r[4], r[5]),
    }
  })
}

/** Accessible summary = the four narration lines joined (brief §5: summary is verbatim narration). */
function summaryOf(s: Scene[]): Localized {
  return l(s.map((x) => x.narration.en).join(' '), s.map((x) => x.narration.ar).join(' '))
}

function check(
  question: [string, string],
  options: [[string, string], [string, string], [string, string]],
  correct: OptionId,
  feedbackCorrect: [string, string],
  /** Hint only; the standard replay/read/retry sentence is appended. */
  retryHint: [string, string],
): KnowledgeCheck {
  const [a, b, c] = options
  return {
    question: l(...question),
    options: [
      { id: 'A', text: l(...a) },
      { id: 'B', text: l(...b) },
      { id: 'C', text: l(...c) },
    ],
    correct,
    feedbackCorrect: l(...feedbackCorrect),
    feedbackRetry: l(`${retryHint[0]} ${RETRY_EN}`, `${retryHint[1]} ${RETRY_AR}`),
  }
}

function sample(id: 'LS02' | 'HF01', posterAlt: Localized): VideoAsset {
  const base = `media/${id}/SEDRA_${id}_EN_v2`
  return {
    video: `${base}_clean.mp4`,
    captions: `${base}.vtt`,
    transcript: `${base}_transcript.txt`,
    descriptiveTranscript: `${base}_descriptive_transcript.txt`,
    poster: `${base}_thumbnail.png`,
    posterAlt,
    version: 'v2',
  }
}

interface UnitInput {
  id: UnitId
  order: number
  title: Localized
  objective: Localized
  sourcePages: string
  scenes: Scene[]
  check: KnowledgeCheck
  practice: Unit['practice']
  imageAlt: Localized
  media?: Unit['media']
  badge?: Localized
}

function ls(u: UnitInput): Unit {
  return build(u, 'healthy-communication', 'life-skills')
}

function hf(u: UnitInput): Unit {
  return build(u, 'intro-hospitality', 'hospitality')
}

function build(u: UnitInput, courseId: CourseId, programmeId: ProgrammeId): Unit {
  return {
    id: u.id,
    courseId,
    programmeId,
    order: u.order,
    title: u.title,
    objective: u.objective,
    sourcePages: u.sourcePages,
    durationSeconds: 30,
    mediaStatus: u.media ? 'sample' : 'pending',
    ...(u.media ? { media: u.media } : {}),
    scenes: u.scenes,
    summary: summaryOf(u.scenes),
    check: u.check,
    practice: u.practice,
    image: `images/units/${u.id}.webp`,
    imageAlt: u.imageAlt,
    ...(u.badge ? { badge: u.badge } : {}),
  }
}

/* ---------------- Life Skills: Healthy Communication ---------------- */

const LS01 = ls({
  id: 'LS01',
  order: 1,
  title: l('What is healthy communication', 'ما هو التواصل الصحي'),
  objective: l(
    'Recognise respectful sharing of thoughts and feelings.',
    'التعرّف على المشاركة المحترمة للأفكار والمشاعر.',
  ),
  sourcePages: 'Life Skills pp 1–4',
  scenes: scenes([
    [
      'Communication means sharing thoughts, feelings or information.',
      'التواصل يعني مشاركة الأفكار أو المشاعر أو المعلومات.',
      'Sharing thoughts and feelings',
      'مشاركة الأفكار والمشاعر',
      'Two peers exchange labelled speech cards.',
      'صديقان يتبادلان بطاقات كلام مكتوب عليها.',
    ],
    [
      'We can use words, signs, pictures or a communication aid.',
      'يمكننا استخدام الكلمات أو الإشارات أو الصور أو وسيلة تواصل.',
      'Many ways to communicate',
      'طرق كثيرة للتواصل',
      'Show speech, gesture and a picture board equally.',
      'عرض الكلام والإشارة ولوحة الصور بشكل متساوٍ.',
    ],
    [
      'Healthy communication helps us share and listen with respect.',
      'التواصل الصحي يساعدنا على المشاركة والاستماع باحترام.',
      'Share and listen',
      'شارك واستمع',
      'One person communicates; the other waits.',
      'شخص يتواصل، والآخر ينتظر.',
    ],
    [
      'Take your time. Your message matters.',
      'خذ وقتك. رسالتك مهمة.',
      'Your message matters',
      'رسالتك مهمة',
      'Hold an uncluttered scene with both peers.',
      'مشهد هادئ وبسيط للصديقين معاً.',
    ],
  ]),
  check: check(
    ['Which is healthy communication?', 'أيّ مما يلي تواصل صحي؟'],
    [
      ['Listening and taking turns', 'الاستماع وتبادل الأدوار'],
      ['Speaking over someone', 'مقاطعة شخص أثناء كلامه'],
      ['Ignoring their message', 'تجاهل رسالته'],
    ],
    'A',
    [
      'Yes. Listening gives another person time to share.',
      'نعم. الاستماع يعطي الشخص الآخر وقتاً للمشاركة.',
    ],
    ['Think about giving each person a turn.', 'فكّر في إعطاء كل شخص دوره.'],
  ),
  practice: {
    prompt: l(
      'Choose a word, picture or gesture to share how you feel. You may pass.',
      'اختر كلمة أو صورة أو إشارة لتشارك شعورك. يمكنك التخطّي.',
    ),
  },
  imageAlt: l(
    'Two peers share labelled speech cards in a calm, uncluttered scene.',
    'صديقان يتبادلان بطاقات كلام في مشهد هادئ وبسيط.',
  ),
})

const LS02 = ls({
  id: 'LS02',
  order: 2,
  title: l('Stop Think Do', 'توقّف فكّر افعل'),
  objective: l('Identify the three steps before responding.', 'معرفة الخطوات الثلاث قبل الرد.'),
  sourcePages: 'Life Skills pp 5 and 11',
  media: {
    en: sample(
      'LS02',
      l('Three labelled cards show Stop Think Do.', 'ثلاث بطاقات مكتوب عليها توقّف فكّر افعل.'),
    ),
  },
  scenes: scenes([
    [
      'A big feeling can make it hard to choose what to do.',
      'قد يجعل الشعور القوي اختيار ما نفعله أمراً صعباً.',
      'A big feeling',
      'شعور قوي',
      'Lena stands still with a labelled upset feeling card.',
      'تقف لينا بهدوء ومعها بطاقة مكتوب عليها شعور بالانزعاج.',
    ],
    [
      'Stop. Pause and notice how you feel.',
      'توقّف. تمهّل ولاحظ شعورك.',
      '1 Stop',
      '١ توقّف',
      'Lena pauses; show a stop symbol and word.',
      'تتوقّف لينا؛ تظهر علامة توقّف وكلمة توقّف.',
    ],
    [
      'Think. What could you say or do that is kind and safe?',
      'فكّر. ماذا يمكنك أن تقول أو تفعل بطريقة لطيفة وآمنة؟',
      '2 Think',
      '٢ فكّر',
      'Two choices appear: ask calmly or take a break.',
      'يظهر خياران: اسأل بهدوء أو خذ استراحة.',
    ],
    [
      'Do. Try your choice. You can stop and think again.',
      'افعل. جرّب اختيارك. يمكنك أن تتوقّف وتفكّر من جديد.',
      '3 Do',
      '٣ افعل',
      'Lena chooses a calm conversation; hold final steps.',
      'تختار لينا حديثاً هادئاً؛ وتبقى الخطوات الأخيرة ظاهرة.',
    ],
  ]),
  check: check(
    ['What comes after Stop?', 'ماذا يأتي بعد توقّف؟'],
    [
      ['Do', 'افعل'],
      ['Think', 'فكّر'],
      ['Shout', 'اصرخ'],
    ],
    'B',
    ['Yes. Think about your choices before you act.', 'نعم. فكّر في خياراتك قبل أن تتصرّف.'],
    ['The steps are Stop, Think, Do.', 'الخطوات هي: توقّف، فكّر، افعل.'],
  ),
  practice: {
    prompt: l(
      'Point to or say the three steps. Choose a safe example to practise, or practise with a supporter.',
      'أشِر إلى الخطوات الثلاث أو قُلها. اختر مثالاً آمناً لتتدرّب عليه، أو تدرّب مع شخص داعم.',
    ),
  },
  imageAlt: l(
    'Lena pauses beside three labelled cards: Stop, Think, Do.',
    'تتوقّف لينا بجانب ثلاث بطاقات: توقّف، فكّر، افعل.',
  ),
  badge: l('Paused and noticed', 'توقّفتُ ولاحظتُ'),
})

const LS03 = ls({
  id: 'LS03',
  order: 3,
  title: l('Choose a calming pause', 'اختر وقفة تساعدك على الهدوء'),
  objective: l('Select a comfortable way to pause.', 'اختيار طريقة مريحة للتوقّف.'),
  sourcePages: 'Life Skills p 6',
  scenes: scenes([
    [
      'When a feeling is strong, you can pause before acting.',
      'عندما يكون الشعور قوياً، يمكنك أن تتوقّف قبل أن تتصرّف.',
      'Pause',
      'توقّف',
      'A person sits comfortably in a quiet space.',
      'شخص يجلس براحة في مكان هادئ.',
    ],
    [
      'You might breathe gently or count backwards slowly.',
      'يمكنك أن تتنفّس بهدوء أو تعدّ تنازلياً ببطء.',
      'Breathe or count',
      'تنفّس أو عُدّ',
      'Show two labelled choice cards, no forced countdown.',
      'عرض بطاقتَي اختيار مكتوب عليهما، دون عدّ تنازلي إجباري.',
    ],
    [
      'You might move in a comfortable way or notice your surroundings.',
      'يمكنك أن تتحرّك بطريقة مريحة أو تلاحظ ما حولك.',
      'Move or notice',
      'تحرّك أو لاحظ',
      'Seated movement and looking at an object are equal options.',
      'الحركة وأنت جالس والنظر إلى شيء خياران متساويان.',
    ],
    [
      'Choose what helps you. You can ask someone for support.',
      'اختر ما يساعدك. يمكنك أن تطلب الدعم من شخص ما.',
      'Choose your way',
      'اختر طريقتك',
      'Person selects a preferred card; supporter stays nearby.',
      'يختار الشخص البطاقة التي يفضّلها؛ ويبقى الشخص الداعم قريباً.',
    ],
  ]),
  check: check(
    [
      'What can you do before acting on a strong feeling?',
      'ماذا يمكنك أن تفعل قبل أن تتصرّف بسبب شعور قوي؟',
    ],
    [
      ['Rush into an argument', 'الدخول بسرعة في جدال'],
      ['Pause in a way that helps you', 'التوقّف بطريقة تساعدك'],
      ['Ignore everyone forever', 'تجاهل الجميع إلى الأبد'],
    ],
    'B',
    ['Yes. A pause gives you time to choose.', 'نعم. التوقّف يعطيك وقتاً للاختيار.'],
    [
      'You can pause, count, move comfortably or ask for help.',
      'يمكنك أن تتوقّف أو تعدّ أو تتحرّك براحة أو تطلب المساعدة.',
    ],
  ),
  practice: {
    prompt: l(
      'Choose one calming option. Practise only if comfortable; no exercise or breathing task is compulsory.',
      'اختر طريقة واحدة تساعدك على الهدوء. تدرّب فقط إذا كنت مرتاحاً؛ لا يوجد تمرين إجباري، ولا تمرين تنفّس إجباري.',
    ),
    choices: [
      l('Breathe gently', 'تنفّس بهدوء'),
      l('Count backwards slowly', 'عُدّ تنازلياً ببطء'),
      l('Move in a comfortable way', 'تحرّك بطريقة مريحة'),
      l('Notice your surroundings', 'لاحظ ما حولك'),
      l('Ask someone for support', 'اطلب الدعم من شخص ما'),
    ],
  },
  imageAlt: l(
    'A person sits comfortably in a quiet space and chooses a calming card.',
    'شخص يجلس براحة في مكان هادئ ويختار بطاقة تساعده على الهدوء.',
  ),
})

const LS04 = ls({
  id: 'LS04',
  order: 4,
  title: l('Lena feels left out', 'لينا تشعر بأنها مُستبعَدة'),
  objective: l('Notice a feeling without judging it.', 'ملاحظة الشعور دون الحكم عليه.'),
  sourcePages: 'Life Skills pp 7–8',
  scenes: scenes([
    [
      'Lena hears that Maya went to the movies with other friends.',
      'تسمع لينا أن مايا ذهبت إلى السينما مع أصدقاء آخرين.',
      'Lena hears some news',
      'لينا تسمع خبراً',
      'Lena hears a simple conversation; no hostile acting.',
      'تسمع لينا حديثاً بسيطاً؛ دون تمثيل عدائي.',
    ],
    [
      'Lena was not invited. She feels hurt and confused.',
      'لم تتلقَّ لينا دعوة. تشعر بالألم والحيرة.',
      'Hurt and confused',
      'متألّمة ومحتارة',
      'Show labelled feeling cards, not facial expression alone.',
      'عرض بطاقات مشاعر مكتوب عليها، وليس تعابير الوجه فقط.',
    ],
    [
      'She stops and notices her feelings before she responds.',
      'تتوقّف وتلاحظ مشاعرها قبل أن تردّ.',
      'Notice the feeling',
      'لاحظ الشعور',
      'Lena pauses; the background stays still.',
      'تتوقّف لينا؛ وتبقى الخلفية ثابتة.',
    ],
    [
      'People can feel differently. Every feeling deserves care.',
      'قد يشعر الناس بطرق مختلفة. كل شعور يستحق الاهتمام.',
      'Feelings can differ',
      'المشاعر قد تختلف',
      'Offer sad, angry, confused and another feeling cards.',
      'عرض بطاقات: حزين، غاضب، محتار، وشعور آخر.',
    ],
  ]),
  check: check(
    ['Which feeling might Lena have?', 'ما الشعور الذي قد تشعر به لينا؟'],
    [
      ['Hurt', 'الألم'],
      ['Confused', 'الحيرة'],
      ['Either can make sense', 'كلاهما ممكن'],
    ],
    'C',
    ['Yes. People may have more than one feeling.', 'نعم. قد يشعر الناس بأكثر من شعور واحد.'],
    ['There is no single feeling everyone must have.', 'لا يوجد شعور واحد يجب أن يشعر به الجميع.'],
  ),
  practice: {
    prompt: l(
      'Choose a possible feeling for Lena. Sharing your own experience is optional.',
      'اختر شعوراً ممكناً للينا. مشاركة تجربتك الشخصية اختيارية.',
    ),
    choices: [
      l('Hurt', 'متألّمة'),
      l('Confused', 'محتارة'),
      l('Sad', 'حزينة'),
      l('Angry', 'غاضبة'),
      l('Another feeling', 'شعور آخر'),
    ],
  },
  imageAlt: l(
    'Lena pauses with labelled feeling cards: hurt and confused.',
    'تتوقّف لينا ومعها بطاقات مشاعر: متألّمة ومحتارة.',
  ),
  badge: l('Recognised a feeling', 'تعرّفتُ على شعور'),
})

const LS05 = ls({
  id: 'LS05',
  order: 5,
  title: l('Think of possible reasons', 'فكّر في أسباب ممكنة'),
  objective: l(
    'Consider more than one explanation before judging.',
    'التفكير في أكثر من سبب قبل الحكم.',
  ),
  sourcePages: 'Life Skills p 9',
  scenes: scenes([
    [
      'Lena does not yet know why she was not invited.',
      'لا تعرف لينا بعد لماذا لم تتلقَّ دعوة.',
      'We do not know yet',
      'لا نعرف بعد',
      'Lena looks at a question card.',
      'تنظر لينا إلى بطاقة سؤال.',
    ],
    [
      'There could be different reasons. She can ask Maya.',
      'قد تكون هناك أسباب مختلفة. يمكنها أن تسأل مايا.',
      'Ask before judging',
      'اسأل قبل أن تحكم',
      'Two blank reason cards appear beside a question.',
      'تظهر بطاقتا سبب فارغتان بجانب سؤال.',
    ],
    [
      'She thinks about a kind question instead of an angry message.',
      'تفكّر في سؤال لطيف بدلاً من رسالة غاضبة.',
      'Think of a kind question',
      'فكّر في سؤال لطيف',
      'Compare labelled calm question and angry message cards.',
      'مقارنة بين بطاقة سؤال هادئ وبطاقة رسالة غاضبة.',
    ],
    [
      'She can say, I felt left out. Can we talk?',
      'يمكنها أن تقول: شعرتُ بأنني مُستبعَدة. هل يمكننا أن نتحدّث؟',
      'Can we talk?',
      'هل يمكننا أن نتحدّث؟',
      'Lena chooses a speech or communication-aid card.',
      'تختار لينا بطاقة كلام أو بطاقة وسيلة تواصل.',
    ],
  ]),
  check: check(
    ['What is a helpful next thought?', 'ما الفكرة المفيدة التالية؟'],
    [
      ['Maya must hate me', 'لا بدّ أن مايا تكرهني'],
      ['I can ask what happened', 'يمكنني أن أسأل عمّا حدث'],
      ['I must shout now', 'يجب أن أصرخ الآن'],
    ],
    'B',
    [
      'Yes. Asking can help Lena understand what happened.',
      'نعم. السؤال يمكن أن يساعد لينا على فهم ما حدث.',
    ],
    ['Lena does not know the reason yet.', 'لينا لا تعرف السبب بعد.'],
  ),
  practice: {
    prompt: l(
      'Choose two possible explanations: limited seats / a family plan / another reason. These are possibilities, not facts about Maya.',
      'اختر سببين ممكنين: مقاعد محدودة / خطة عائلية / سبب آخر. هذه احتمالات، وليست حقائق عن مايا.',
    ),
    choices: [
      l('Limited seats', 'مقاعد محدودة'),
      l('A family plan', 'خطة عائلية'),
      l('Another reason', 'سبب آخر'),
    ],
    multiple: true,
  },
  imageAlt: l(
    'Lena looks at a question card and chooses a card that says Can we talk?',
    'تنظر لينا إلى بطاقة سؤال وتختار بطاقة مكتوب عليها: هل يمكننا أن نتحدّث؟',
  ),
})

const LS06 = ls({
  id: 'LS06',
  order: 6,
  title: l('Choose a kind and safe action', 'اختر تصرّفاً لطيفاً وآمناً'),
  objective: l(
    'Choose a calm response to a friendship problem.',
    'اختيار ردّ هادئ على مشكلة بين الأصدقاء.',
  ),
  sourcePages: 'Life Skills pp 10–11',
  scenes: scenes([
    [
      'Lena has paused and thought about her choices.',
      'توقّفت لينا وفكّرت في خياراتها.',
      'Ready to choose',
      'جاهزة للاختيار',
      'Show Stop and Think already checked with text.',
      'عرض خطوتَي توقّف وفكّر مع علامة إتمام ونص.',
    ],
    [
      'She chooses to speak with Maya calmly.',
      'تختار أن تتحدّث مع مايا بهدوء.',
      'Talk calmly',
      'تحدّث بهدوء',
      'Two peers have comfortable space; no required eye contact.',
      'صديقتان بينهما مسافة مريحة؛ دون حاجة إلى النظر في العينين.',
    ],
    [
      'I felt left out, Lena says. Can you tell me what happened?',
      'تقول لينا: شعرتُ بأنني مُستبعَدة. هل يمكنكِ أن تخبريني بما حدث؟',
      'Share and ask',
      'شارك واسأل',
      'Display a short communication card.',
      'عرض بطاقة تواصل قصيرة.',
    ],
    [
      'If talking feels hard, she can take a break or ask for help.',
      'إذا كان الكلام صعباً، يمكنها أن تأخذ استراحة أو تطلب المساعدة.',
      'A break or help is okay',
      'الاستراحة أو طلب المساعدة أمر مقبول',
      'Show break and supporter options without failure signs.',
      'عرض خيارَي الاستراحة والشخص الداعم دون علامات فشل.',
    ],
  ]),
  check: check(
    ['Which action could help?', 'أيّ تصرّف قد يساعد؟'],
    [
      ['Send an angry message', 'إرسال رسالة غاضبة'],
      ['Talk calmly or ask for support', 'التحدّث بهدوء أو طلب الدعم'],
      ['Push Maya', 'دفع مايا'],
    ],
    'B',
    ['Yes. Calm communication and support can help.', 'نعم. التواصل الهادئ والدعم يمكن أن يساعدا.'],
    ['Choose an action that is kind and safe.', 'اختر تصرّفاً لطيفاً وآمناً.'],
  ),
  practice: {
    prompt: l(
      'Practise the sentence with a partner, a picture card or a communication aid. Solo practice is also fine.',
      'تدرّب على الجملة مع شريك، أو باستخدام بطاقة صور أو وسيلة تواصل. التدرّب وحدك مقبول أيضاً.',
    ),
  },
  imageAlt: l(
    'Lena and Maya talk calmly with a short communication card.',
    'لينا ومايا تتحدّثان بهدوء مع بطاقة تواصل قصيرة.',
  ),
  badge: l('Tried a kind response', 'جرّبتُ ردّاً لطيفاً'),
})

const LS07 = ls({
  id: 'LS07',
  order: 7,
  title: l('Why the steps help', 'لماذا تساعد الخطوات'),
  objective: l(
    'Connect Stop Think Do to constructive choices.',
    'ربط خطوات توقّف فكّر افعل باختيارات مفيدة.',
  ),
  sourcePages: 'Life Skills p 12',
  scenes: scenes([
    [
      'Stopping gives us a moment before we act.',
      'التوقّف يعطينا لحظة قبل أن نتصرّف.',
      'A moment to pause',
      'لحظة للتوقّف',
      'Show a pause card.',
      'عرض بطاقة توقّف.',
    ],
    [
      'Thinking helps us notice choices and possible results.',
      'التفكير يساعدنا على ملاحظة الخيارات والنتائج الممكنة.',
      'Notice choices',
      'لاحظ الخيارات',
      'A simple fork offers talk or break.',
      'طريق بسيط يتفرّع إلى خيارين: التحدّث أو الاستراحة.',
    ],
    [
      'Doing a kind, safe action can help solve a problem.',
      'القيام بتصرّف لطيف وآمن يمكن أن يساعد على حلّ مشكلة.',
      'Try a safe action',
      'جرّب تصرّفاً آمناً',
      'Two peers discuss a problem respectfully.',
      'صديقان يناقشان مشكلة باحترام.',
    ],
    [
      'We can practise again. Small steps help us learn.',
      'يمكننا أن نتدرّب مرة أخرى. الخطوات الصغيرة تساعدنا على التعلّم.',
      'Practise again',
      'تدرّب مرة أخرى',
      'Return to the three labelled steps; no score ranking.',
      'العودة إلى الخطوات الثلاث المكتوبة؛ دون درجات أو ترتيب.',
    ],
  ]),
  check: check(
    ['Why can Stop Think Do help?', 'لماذا يمكن أن تساعد خطوات توقّف فكّر افعل؟'],
    [
      ['It guarantees nobody feels sad', 'تضمن ألّا يحزن أحد'],
      ['It gives time to choose an action', 'تعطي وقتاً لاختيار تصرّف'],
      ['It makes everyone agree', 'تجعل الجميع يتّفقون'],
    ],
    'B',
    ['Yes. The steps give us time to choose.', 'نعم. الخطوات تعطينا وقتاً للاختيار.'],
    [
      'The steps help with choices; they cannot control other people.',
      'الخطوات تساعد في الاختيار؛ لكنها لا تتحكّم في الآخرين.',
    ],
  ),
  practice: {
    prompt: l(
      'Choose one situation where taking a pause could help. You may use Lena’s example instead of a personal story.',
      'اختر موقفاً واحداً قد يساعد فيه التوقّف. يمكنك استخدام مثال لينا بدلاً من قصة شخصية.',
    ),
  },
  imageAlt: l(
    'Two peers talk respectfully beside three labelled steps: Stop, Think, Do.',
    'صديقان يتحدّثان باحترام بجانب ثلاث خطوات: توقّف، فكّر، افعل.',
  ),
})

const LS08 = ls({
  id: 'LS08',
  order: 8,
  title: l('My communication playbook', 'دليلي للتواصل'),
  objective: l(
    'Create a simple reminder for future practice.',
    'صنع تذكير بسيط للتدرّب في المستقبل.',
  ),
  sourcePages: 'Life Skills pp 2 and 13–15',
  scenes: scenes([
    [
      'Keep a small reminder of Stop, Think, Do.',
      'احتفظ بتذكير صغير بالخطوات: توقّف، فكّر، افعل.',
      'My reminder',
      'تذكيري',
      'A three-card playbook opens.',
      'يُفتح دليل من ثلاث بطاقات.',
    ],
    [
      'Choose one way to pause that feels comfortable.',
      'اختر طريقة واحدة مريحة لك للتوقّف.',
      'My pause',
      'وقفتي',
      'Select count, break, gentle breath or support.',
      'اختيار: العدّ، أو الاستراحة، أو التنفّس بهدوء، أو الدعم.',
    ],
    [
      'Choose a kind phrase or picture to ask for help.',
      'اختر عبارة لطيفة أو صورة لتطلب المساعدة.',
      'My help message',
      'رسالتي لطلب المساعدة',
      'Show Can we talk? and I need help cards.',
      'عرض بطاقتَي: هل يمكننا أن نتحدّث؟ وأحتاج إلى مساعدة.',
    ],
    [
      'You can return to this guide and practise at your own pace.',
      'يمكنك العودة إلى هذا الدليل والتدرّب حسب سرعتك.',
      'Learn at your pace',
      'تعلّم حسب سرعتك',
      'Save reminder button; four quiet badge outlines.',
      'زر حفظ التذكير؛ وأربع شارات بخطوط هادئة.',
    ],
  ]),
  check: check(
    ['What belongs in your playbook?', 'ماذا تضع في دليلك؟'],
    [
      ['A helpful pause and a kind message', 'وقفة مفيدة ورسالة لطيفة'],
      ['A deadline to stop feeling upset', 'موعد نهائي لتتوقّف عن الشعور بالانزعاج'],
      ['A rule to always agree', 'قاعدة أن توافق دائماً'],
    ],
    'A',
    ['Yes. A reminder can help you practise.', 'نعم. التذكير يمكن أن يساعدك على التدرّب.'],
    [
      'Choose a tool you can use when you need support.',
      'اختر أداة يمكنك استخدامها عندما تحتاج إلى الدعم.',
    ],
  ),
  practice: {
    prompt: l(
      'Select one pause card and one communication card, then Save my reminder. Offer printable and HTML versions; no personal disclosure required.',
      'اختر بطاقة توقّف واحدة وبطاقة تواصل واحدة، ثم اختر احفظ تذكيري. تتوفّر نسخة للطباعة ونسخة على الصفحة؛ لا حاجة إلى مشاركة معلومات شخصية.',
    ),
    /** Pause cards only (brief §5 LS08 scene 2). Communication cards are not representable here. */
    choices: [
      l('Count', 'العدّ'),
      l('Break', 'استراحة'),
      l('Gentle breath', 'تنفّس هادئ'),
      l('Support', 'الدعم'),
    ],
  },
  imageAlt: l(
    'A three-card playbook with a pause card and a help message card.',
    'دليل من ثلاث بطاقات فيه بطاقة توقّف وبطاقة رسالة لطلب المساعدة.',
  ),
  badge: l('Built a reminder', 'صنعتُ تذكيراً'),
})

/* ---------------- Hospitality for All: Introduction to Hospitality ---------------- */

const HF01 = hf({
  id: 'HF01',
  order: 1,
  title: l('A warm welcome', 'ترحيب دافئ'),
  objective: l(
    'Recognise hospitality as helping people feel welcome safe and comfortable.',
    'التعرّف على الضيافة بأنها مساعدة الناس على الشعور بالترحيب والأمان والراحة.',
  ),
  sourcePages: 'Hospitality pp 4–5',
  media: {
    en: sample(
      'HF01',
      l(
        'A host offers a welcome card to a guest at reception.',
        'مضيف يقدّم بطاقة ترحيب لضيف في منطقة الاستقبال.',
      ),
    ),
  },
  scenes: scenes([
    [
      'Hospitality means helping people feel welcome, safe and comfortable.',
      'الضيافة هي مساعدة الناس على الشعور بالترحيب والأمان والراحة.',
      'Welcome • Safe • Comfortable',
      'ترحيب • أمان • راحة',
      'Adult guest enters a clear reception area.',
      'ضيف بالغ يدخل منطقة استقبال واضحة.',
    ],
    [
      'Say hello in a way that works for you.',
      'ألقِ التحية بالطريقة التي تناسبك.',
      'Hello',
      'مرحباً',
      'Host uses speech or a welcome card; no forced smile.',
      'المضيف يستخدم الكلام أو بطاقة ترحيب؛ دون ابتسامة مفروضة.',
    ],
    [
      'Ask, How can I help? Then give the guest time to respond.',
      'اسأل: كيف يمكنني مساعدتك؟ ثم امنح الضيف وقتاً للرد.',
      'How can I help?',
      'كيف يمكنني مساعدتك؟',
      'Host waits; guest points to a direction symbol.',
      'المضيف ينتظر؛ والضيف يشير إلى رمز اتجاه.',
    ],
    [
      'A kind welcome can make a difference.',
      'قد تصنع التحية اللطيفة فرقاً.',
      'A kind welcome',
      'ترحيب لطيف',
      'Host offers directions respectfully; hold final scene.',
      'المضيف يدلّ على الطريق باحترام؛ ويبقى المشهد الأخير ظاهراً.',
    ],
  ]),
  check: check(
    ['Which action shows hospitality?', 'أيّ تصرّف يُظهر الضيافة؟'],
    [
      ['Ignoring a guest', 'تجاهل الضيف'],
      ['Offering a welcome and help', 'تقديم الترحيب والمساعدة'],
      ['Rushing a guest', 'استعجال الضيف'],
    ],
    'B',
    [
      'Yes. A welcome and an offer of help show hospitality.',
      'نعم. الترحيب وعرض المساعدة يُظهران الضيافة.',
    ],
    [
      'Think about helping someone feel welcome and comfortable.',
      'فكّر في مساعدة الشخص على الشعور بالترحيب والراحة.',
    ],
  ),
  practice: {
    prompt: l(
      'Practise a greeting with words, a gesture or a communication card. Eye contact and smiling are optional.',
      'تدرّب على التحية بالكلمات أو بإشارة أو ببطاقة تواصل. النظر في العينين والابتسام أمران اختياريان.',
    ),
  },
  imageAlt: l(
    'A host offers a welcome card to a guest at a clear reception area.',
    'مضيف يقدّم بطاقة ترحيب لضيف في منطقة استقبال واضحة.',
  ),
})

const HF02 = hf({
  id: 'HF02',
  order: 2,
  title: l('Where hospitality happens', 'أين تحدث الضيافة'),
  objective: l(
    'Identify everyday hospitality settings.',
    'التعرّف على أماكن الضيافة في الحياة اليومية.',
  ),
  sourcePages: 'Hospitality p 6',
  scenes: scenes([
    [
      'Hospitality can happen at home when someone visits.',
      'يمكن أن تحدث الضيافة في البيت عندما يزورنا شخص ما.',
      'At home',
      'في البيت',
      'Host welcomes a visitor at the door.',
      'المضيف يرحّب بزائر عند الباب.',
    ],
    [
      'It can happen in hotels, malls and theme parks.',
      'ويمكن أن تحدث في الفنادق ومراكز التسوّق والمدن الترفيهية.',
      'In many places',
      'في أماكن كثيرة',
      'Three labelled setting cards appear slowly.',
      'تظهر ببطء ثلاث بطاقات أماكن مكتوب عليها.',
    ],
    [
      'It also happens in cinemas and hospitals.',
      'وتحدث أيضاً في دور السينما والمستشفيات.',
      'Cinema • Hospital',
      'سينما • مستشفى',
      'Two clear setting cards; no rapid cuts.',
      'بطاقتا أماكن واضحتان؛ دون انتقالات سريعة.',
    ],
    [
      'In each place, people can offer a welcome and help.',
      'في كل مكان، يمكن للناس أن يقدّموا الترحيب والمساعدة.',
      'Welcome and help',
      'ترحيب ومساعدة',
      'Return to one shared help symbol.',
      'العودة إلى رمز مساعدة واحد مشترك.',
    ],
  ]),
  check: check(
    ['Where can hospitality happen?', 'أين يمكن أن تحدث الضيافة؟'],
    [
      ['Only in hotels', 'في الفنادق فقط'],
      ['At home and in many public places', 'في البيت وفي أماكن عامة كثيرة'],
      ['Only at a restaurant', 'في المطعم فقط'],
    ],
    'B',
    [
      'Yes. Hospitality can happen in everyday places.',
      'نعم. يمكن أن تحدث الضيافة في أماكن الحياة اليومية.',
    ],
    [
      'Think about a visit at home as well as public places.',
      'فكّر في زيارة في البيت، وكذلك في الأماكن العامة.',
    ],
  ),
  practice: {
    prompt: l(
      'Choose a setting card: home / hotel / mall / theme park / cinema / hospital. Say or select one welcome action there.',
      'اختر بطاقة مكان: البيت / الفندق / مركز التسوّق / المدينة الترفيهية / السينما / المستشفى. قُل أو اختر تصرّفاً واحداً للترحيب هناك.',
    ),
    choices: [
      l('Home', 'البيت'),
      l('Hotel', 'الفندق'),
      l('Mall', 'مركز التسوّق'),
      l('Theme park', 'المدينة الترفيهية'),
      l('Cinema', 'السينما'),
      l('Hospital', 'المستشفى'),
    ],
  },
  imageAlt: l(
    'A host welcomes a visitor at the door, with labelled cards for everyday places.',
    'مضيف يرحّب بزائر عند الباب، مع بطاقات لأماكن من الحياة اليومية.',
  ),
})

const HF03 = hf({
  id: 'HF03',
  order: 3,
  title: l('Why hospitality matters', 'لماذا الضيافة مهمة'),
  objective: l(
    'Explain one benefit of welcoming behaviour.',
    'شرح فائدة واحدة للتصرّف بطريقة مُرحِّبة.',
  ),
  sourcePages: 'Hospitality pp 5 and 7',
  scenes: scenes([
    [
      'A welcome can help a visitor feel included.',
      'الترحيب يمكن أن يساعد الزائر على الشعور بأنه جزء من المكان.',
      'Feel included',
      'الشعور بالانتماء',
      'A visitor joins a reception calmly.',
      'زائر يدخل الاستقبال بهدوء.',
    ],
    [
      'Listening and helping can create a good experience.',
      'الاستماع والمساعدة يمكن أن يصنعا تجربة جيدة.',
      'A good experience',
      'تجربة جيدة',
      'A host listens and offers a map.',
      'مضيف يستمع ويقدّم خريطة.',
    ],
    [
      'Kind actions can build trust and bring people together.',
      'التصرّفات اللطيفة يمكن أن تبني الثقة وتقرّب الناس من بعضهم.',
      'Build trust',
      'بناء الثقة',
      'Two people collaborate without physical contact.',
      'شخصان يتعاونان دون لمس.',
    ],
    [
      'Good experiences can also help a business grow.',
      'التجارب الجيدة يمكن أن تساعد أيضاً على نموّ العمل التجاري.',
      'Help people and businesses',
      'مساعدة الناس والأعمال التجارية',
      'A guest chooses to return; no sales promises.',
      'ضيف يختار أن يعود؛ دون وعود بالبيع.',
    ],
  ]),
  check: check(
    ['Why is hospitality important?', 'لماذا الضيافة مهمة؟'],
    [
      ['It helps people feel welcome and cared for', 'تساعد الناس على الشعور بالترحيب والاهتمام'],
      ['It means always saying yes', 'تعني أن تقول نعم دائماً'],
      ['It means doing everything quickly', 'تعني أن تفعل كل شيء بسرعة'],
    ],
    'A',
    [
      'Yes. Hospitality helps people feel welcome and cared for.',
      'نعم. الضيافة تساعد الناس على الشعور بالترحيب والاهتمام.',
    ],
    [
      'Focus on how the person feels, not speed or agreeing to everything.',
      'ركّز على شعور الشخص، وليس على السرعة أو الموافقة على كل شيء.',
    ],
  ),
  practice: {
    prompt: l(
      'Choose a benefit card: feel welcome / build trust / good experience. Explain using a word, picture or example.',
      'اختر بطاقة فائدة: الشعور بالترحيب / بناء الثقة / تجربة جيدة. اشرح باستخدام كلمة أو صورة أو مثال.',
    ),
    choices: [
      l('Feel welcome', 'الشعور بالترحيب'),
      l('Build trust', 'بناء الثقة'),
      l('Good experience', 'تجربة جيدة'),
    ],
  },
  imageAlt: l(
    'A host listens to a visitor and offers a map at reception.',
    'مضيف يستمع إلى زائر ويقدّم له خريطة في الاستقبال.',
  ),
})

const HF04 = hf({
  id: 'HF04',
  order: 4,
  title: l('Listen and offer help', 'استمع وقدّم المساعدة'),
  objective: l('Choose a respectful offer of assistance.', 'اختيار طريقة محترمة لعرض المساعدة.'),
  sourcePages: 'Hospitality p 5 examples',
  scenes: scenes([
    [
      'A guest may need directions, a drink or information.',
      'قد يحتاج الضيف إلى معرفة الطريق، أو إلى مشروب، أو إلى معلومات.',
      'What does the guest need?',
      'ماذا يحتاج الضيف؟',
      'Guest looks at a simple map.',
      'الضيف ينظر إلى خريطة بسيطة.',
    ],
    [
      'Ask what they need and allow time for an answer.',
      'اسأل عمّا يحتاجه، وأعطِه وقتاً للإجابة.',
      'Ask and wait',
      'اسأل وانتظر',
      'Host offers a question card and waits.',
      'المضيف يقدّم بطاقة سؤال وينتظر.',
    ],
    [
      'Listen to the answer before offering help.',
      'استمع إلى الإجابة قبل أن تقدّم المساعدة.',
      'Listen first',
      'استمع أولاً',
      'Guest indicates the direction symbol.',
      'الضيف يشير إلى رمز الاتجاه.',
    ],
    [
      'Offer useful help. If you are unsure, ask a colleague.',
      'قدّم مساعدة مفيدة. إذا لم تكن متأكداً، اسأل زميلاً.',
      'Offer help',
      'قدّم المساعدة',
      'Host points to a map or a help desk; no grabbing.',
      'المضيف يشير إلى خريطة أو إلى مكتب المساعدة؛ دون إمساك الضيف.',
    ],
  ]),
  check: check(
    ['A guest looks unsure. What could you do?', 'يبدو الضيف غير متأكد. ماذا يمكنك أن تفعل؟'],
    [
      ['Take their arm without asking', 'تمسك ذراعه دون أن تسأل'],
      ['Ask if they would like help', 'تسأله إن كان يريد المساعدة'],
      ['Speak over them', 'تقاطعه أثناء كلامه'],
    ],
    'B',
    ['Yes. Asking respects the guest’s choice.', 'نعم. السؤال يحترم اختيار الضيف.'],
    ['Let the guest tell you what they need.', 'دع الضيف يخبرك بما يحتاجه.'],
  ),
  practice: {
    prompt: l(
      'Practise How can I help? Give the other person time to answer in their preferred way.',
      'تدرّب على قول: كيف يمكنني مساعدتك؟ أعطِ الشخص الآخر وقتاً ليجيب بالطريقة التي يفضّلها.',
    ),
  },
  imageAlt: l(
    'A host offers a question card while a guest looks at a simple map.',
    'مضيف يقدّم بطاقة سؤال بينما ينظر الضيف إلى خريطة بسيطة.',
  ),
})

const HF05 = hf({
  id: 'HF05',
  order: 5,
  title: l('Think about an experience', 'فكّر في تجربة'),
  objective: l(
    'Recognise how interactions may feel.',
    'التعرّف على الشعور الذي قد يتركه التعامل مع الآخرين.',
  ),
  sourcePages: 'Hospitality p 8',
  scenes: scenes([
    [
      'Think about a visit, or use an imaginary example.',
      'فكّر في زيارة، أو استخدم مثالاً من الخيال.',
      'Choose an example',
      'اختر مثالاً',
      'Show real or imaginary example buttons.',
      'عرض زرَّين: مثال حقيقي أو مثال من الخيال.',
    ],
    [
      'What helped the person feel welcome or happy?',
      'ما الذي ساعد الشخص على الشعور بالترحيب أو السعادة؟',
      'What felt welcoming?',
      'ما الذي جعلك تشعر بالترحيب؟',
      'A host gives clear information.',
      'مضيف يعطي معلومات واضحة.',
    ],
    [
      'Was anything upsetting or uncomfortable? Feelings can differ.',
      'هل كان هناك شيء مزعج أو غير مريح؟ المشاعر قد تختلف.',
      'Feelings can differ',
      'المشاعر قد تختلف',
      'Offer labelled comfortable and uncomfortable cards.',
      'عرض بطاقتين مكتوب عليهما: مريح وغير مريح.',
    ],
    [
      'You can share one thought, or choose to pass.',
      'يمكنك أن تشارك فكرة واحدة، أو أن تختار التخطّي.',
      'Share or pass',
      'شارك أو تخطَّ',
      'No public leaderboard or compulsory recording.',
      'لا توجد لوحة ترتيب عامة، ولا تسجيل إجباري.',
    ],
  ]),
  check: check(
    [
      'Do people always feel the same about an interaction?',
      'هل يشعر الناس دائماً بالشعور نفسه تجاه موقف ما؟',
    ],
    [
      ['Yes, always', 'نعم، دائماً'],
      ['No, feelings can differ', 'لا، المشاعر قد تختلف'],
      ['Only staff feelings matter', 'مشاعر الموظفين فقط هي المهمة'],
    ],
    'B',
    [
      'Yes. Different people may experience a situation differently.',
      'نعم. قد يعيش الناس الموقف نفسه بطرق مختلفة.',
    ],
    [
      'Listen to the person instead of guessing how they feel.',
      'استمع إلى الشخص بدلاً من أن تخمّن شعوره.',
    ],
  ),
  practice: {
    prompt: l(
      'Choose good / uncomfortable / enjoyable for a fictional visit. Optional short text or spoken discussion; no sensitive details stored.',
      'اختر: جيدة / غير مريحة / ممتعة لزيارة من الخيال. يمكنك كتابة نص قصير أو التحدّث إذا أردت؛ لا يتم حفظ أي تفاصيل خاصة.',
    ),
    choices: [l('Good', 'جيدة'), l('Uncomfortable', 'غير مريحة'), l('Enjoyable', 'ممتعة')],
  },
  imageAlt: l(
    'A host gives clear information beside labelled comfortable and uncomfortable cards.',
    'مضيف يعطي معلومات واضحة بجانب بطاقتين: مريح وغير مريح.',
  ),
})

const HF06 = hf({
  id: 'HF06',
  order: 6,
  title: l('Notice helpful interactions', 'لاحظ التعامل المفيد'),
  objective: l(
    'Identify a positive and a negative interaction.',
    'التعرّف على تعامل إيجابي وتعامل سلبي.',
  ),
  sourcePages: 'Hospitality p 9 video activity',
  scenes: scenes([
    [
      'Notice what people do during a visit.',
      'لاحظ ماذا يفعل الناس أثناء الزيارة.',
      'Watch one interaction',
      'شاهد تعاملاً واحداً',
      'Two short fictional reception scenes.',
      'مشهدان قصيران من الخيال في منطقة الاستقبال.',
    ],
    [
      'In one example, the host listens and gives clear directions.',
      'في مثال، يستمع المضيف ويدلّ على الطريق بوضوح.',
      'Listens and helps',
      'يستمع ويساعد',
      'Guest points to map; host responds.',
      'الضيف يشير إلى الخريطة؛ والمضيف يستجيب.',
    ],
    [
      'In another, the host ignores the guest asking for help.',
      'وفي مثال آخر، يتجاهل المضيف الضيف الذي يطلب المساعدة.',
      'Ignores a request',
      'يتجاهل الطلب',
      'Quiet scene without humiliating performance.',
      'مشهد هادئ دون تمثيل مُهين.',
    ],
    [
      'Which action helps the guest feel welcome?',
      'أيّ تصرّف يساعد الضيف على الشعور بالترحيب؟',
      'Choose the helpful action',
      'اختر التصرّف المفيد',
      'Display labelled choice cards side by side.',
      'عرض بطاقات اختيار مكتوب عليها جنباً إلى جنب.',
    ],
  ]),
  check: check(
    ['Which interaction is positive?', 'أيّ تعامل إيجابي؟'],
    [
      ['Listening and offering directions', 'الاستماع والدلالة على الطريق'],
      ['Ignoring a request for help', 'تجاهل طلب المساعدة'],
      ['Rushing someone away', 'استعجال الشخص ليغادر'],
    ],
    'A',
    [
      'Yes. Listening and offering useful help is positive hospitality.',
      'نعم. الاستماع وتقديم مساعدة مفيدة ضيافة إيجابية.',
    ],
    [
      'Look for an action that responds to what the guest needs.',
      'ابحث عن تصرّف يلبّي ما يحتاجه الضيف.',
    ],
  ),
  practice: {
    prompt: l(
      'Select Helpful or Not helpful for two cards: Gives clear directions / Ignores the guest. Use buttons, not drag-and-drop.',
      'اختر مفيد أو غير مفيد لبطاقتين: يدلّ على الطريق بوضوح / يتجاهل الضيف. استخدم الأزرار، وليس السحب والإفلات.',
    ),
  },
  imageAlt: l(
    'A guest points to a map at reception and the host responds.',
    'ضيف يشير إلى خريطة في الاستقبال، والمضيف يستجيب.',
  ),
})

const HF07 = hf({
  id: 'HF07',
  order: 7,
  title: l('Practise and sort', 'تدرّب وصنّف'),
  objective: l(
    'Practise a welcome and classify hospitality actions.',
    'التدرّب على الترحيب وتصنيف تصرّفات الضيافة.',
  ),
  sourcePages: 'Hospitality pp 10–11',
  scenes: scenes([
    [
      'Practise a short welcome with a partner, or on your own.',
      'تدرّب على ترحيب قصير مع شريك، أو وحدك.',
      'Practise your way',
      'تدرّب بطريقتك',
      'Host and guest role cards; solo option visible.',
      'بطاقتا دور المضيف والضيف؛ وخيار التدرّب وحدك ظاهر.',
    ],
    [
      'Take turns offering help and responding as a guest.',
      'تبادلوا الأدوار: قدّم المساعدة، ثم ردّ كضيف.',
      'Take turns',
      'تبادلوا الأدوار',
      'Two brief calm exchanges.',
      'حواران قصيران وهادئان.',
    ],
    [
      'Notice how the interaction felt. You can choose a feeling card.',
      'لاحظ كيف كان شعورك أثناء التعامل. يمكنك أن تختار بطاقة شعور.',
      'How did it feel?',
      'كيف كان الشعور؟',
      'Offer comfortable, unsure and another feeling cards.',
      'عرض بطاقات: مرتاح، غير متأكد، وشعور آخر.',
    ],
    [
      'Sort actions into helpful and not helpful. Ask for support anytime.',
      'صنّف التصرّفات إلى مفيدة وغير مفيدة. اطلب الدعم في أي وقت.',
      'Helpful or not helpful',
      'مفيد أو غير مفيد',
      'Tap-to-select sorting cards with text labels.',
      'بطاقات تصنيف تختارها بالضغط، وعليها كلمات.',
    ],
  ]),
  check: check(
    [
      'A host waits while a guest responds. Is this helpful?',
      'ينتظر المضيف بينما يردّ الضيف. هل هذا مفيد؟',
    ],
    [
      ['Helpful', 'مفيد'],
      ['Not helpful', 'غير مفيد'],
      ['It only matters if they speak quickly', 'يهمّ فقط إذا تكلّم بسرعة'],
    ],
    'A',
    ['Yes. Waiting gives the guest time to communicate.', 'نعم. الانتظار يعطي الضيف وقتاً للتواصل.'],
    [
      'People may need different amounts of time to respond.',
      'قد يحتاج الناس إلى أوقات مختلفة للرد.',
    ],
  ),
  practice: {
    prompt: l(
      'Roleplay Hello. How can I help? Then classify Waits for a response as Helpful and Interrupts the guest as Not helpful. No negative roleplay is compulsory.',
      'مثّل الدور: مرحباً. كيف يمكنني مساعدتك؟ ثم صنّف «ينتظر الرد» على أنه مفيد، و«يقاطع الضيف» على أنه غير مفيد. لا يوجد تمثيل سلبي إجباري.',
    ),
  },
  imageAlt: l(
    'Host and guest role cards with helpful and not helpful sorting cards.',
    'بطاقتا دور المضيف والضيف مع بطاقات تصنيف: مفيد وغير مفيد.',
  ),
})

const HF08 = hf({
  id: 'HF08',
  order: 8,
  title: l('Use hospitality today', 'استخدم الضيافة اليوم'),
  objective: l(
    'Recall the meaning and choose an everyday action.',
    'تذكّر معنى الضيافة واختيار تصرّف يومي.',
  ),
  sourcePages: 'Hospitality p 12 wrap-up and practice',
  scenes: scenes([
    [
      'Hospitality helps people feel welcome, safe and comfortable.',
      'الضيافة تساعد الناس على الشعور بالترحيب والأمان والراحة.',
      'Welcome • Safe • Comfortable',
      'ترحيب • أمان • راحة',
      'Three labelled reminder cards.',
      'ثلاث بطاقات تذكير مكتوب عليها.',
    ],
    [
      'You can practise at home or in the community.',
      'يمكنك أن تتدرّب في البيت أو في المجتمع.',
      'Practise in daily life',
      'تدرّب في حياتك اليومية',
      'Home and community setting choices.',
      'خياران للمكان: البيت والمجتمع.',
    ],
    [
      'Choose a small action, such as a greeting or offering directions.',
      'اختر تصرّفاً صغيراً، مثل التحية أو الدلالة على الطريق.',
      'Choose one kind action',
      'اختر تصرّفاً لطيفاً واحداً',
      'A greeting card and a map card.',
      'بطاقة تحية وبطاقة خريطة.',
    ],
    [
      'Reflect on what happened. You can share next time if you wish.',
      'فكّر فيما حدث. يمكنك أن تشارك في المرة القادمة إذا أردت.',
      'Reflect and share if you wish',
      'فكّر وشارك إذا أردت',
      'Save practice plan, not an employment certificate.',
      'حفظ خطة التدرّب، وهي ليست شهادة عمل.',
    ],
  ]),
  check: check(
    ['Which is a good practice plan?', 'ما خطة التدرّب الجيدة؟'],
    [
      [
        'Offer a greeting or help when appropriate',
        'تقديم التحية أو المساعدة عندما يكون ذلك مناسباً',
      ],
      ['Promise to do anything a guest asks', 'الوعد بفعل أي شيء يطلبه الضيف'],
      ['Force someone to accept help', 'إجبار شخص على قبول المساعدة'],
    ],
    'A',
    [
      'Yes. A small respectful action is a good way to practise.',
      'نعم. التصرّف الصغير المحترم طريقة جيدة للتدرّب.',
    ],
    [
      'Choose a welcome action that respects the other person.',
      'اختر تصرّف ترحيب يحترم الشخص الآخر.',
    ],
  ),
  practice: {
    prompt: l(
      'Choose greet / offer directions / listen. Mark Planned, Done, Later or With help. Invite a brief optional example at the next session.',
      'اختر: ألقِ التحية / دُلّ على الطريق / استمع. حدّد: مُخطَّط، تمّ، لاحقاً، أو بمساعدة. يمكنك مشاركة مثال قصير في الجلسة القادمة إذا أردت.',
    ),
    choices: [
      l('Greet', 'ألقِ التحية'),
      l('Offer directions', 'دُلّ على الطريق'),
      l('Listen', 'استمع'),
    ],
  },
  imageAlt: l(
    'Three labelled reminder cards with a greeting card and a map card.',
    'ثلاث بطاقات تذكير مع بطاقة تحية وبطاقة خريطة.',
  ),
})

export const UNITS: Unit[] = [
  LS01,
  LS02,
  LS03,
  LS04,
  LS05,
  LS06,
  LS07,
  LS08,
  HF01,
  HF02,
  HF03,
  HF04,
  HF05,
  HF06,
  HF07,
  HF08,
]
