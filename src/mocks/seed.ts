import type {
  LearnerState,
  LiveSession,
  OptionId,
  Persona,
  Prefs,
  SupportRequest,
  UnitProgress,
} from '@shared/types'

/** All people and records here are fictional demo data (brief §1). */

export const DEFAULT_PREFS: Prefs = {
  lang: 'en',
  view: 'standard',
  textSize: 100,
  contrast: 'standard',
  captions: true,
  reducedMotion: 'system',
  readAloud: false,
}

export const PERSONAS: Persona[] = [
  {
    id: 'new-learner',
    role: 'learner',
    name: { en: 'New learner', ar: 'متعلّم جديد' },
    description: {
      en: 'First visit. Choose how you like to learn, then start.',
      ar: 'الزيارة الأولى. اختر طريقة التعلّم التي تناسبك، ثم ابدأ.',
    },
    home: '/preferences',
    avatar: 'images/persona-new-learner.webp',
  },
  {
    id: 'noor',
    role: 'learner',
    name: { en: 'Noor', ar: 'نور' },
    description: {
      en: 'Returning learner. Continue from where you stopped.',
      ar: 'متعلّمة عائدة. تابعي من حيث توقّفتِ.',
    },
    home: '/learn',
    avatar: 'images/persona-noor.webp',
  },
  {
    id: 'admin',
    role: 'admin',
    name: { en: 'SEDRA admin', ar: 'مشرف سدرة' },
    description: {
      en: 'Programmes, learners, sessions and reports. Fictional data only.',
      ar: 'البرامج والمتعلّمون والجلسات والتقارير. بيانات وهمية فقط.',
    },
    home: '/admin',
    avatar: 'images/persona-admin.webp',
  },
]

function doneUnit(selected: OptionId): UnitProgress {
  return {
    watchedOrRead: true,
    checkReviewed: true,
    checkOutcome: 'correct',
    selected,
    attempts: 1,
    practice: 'done',
    seen: ['media', 'summary', 'read'],
  }
}

export function seedLearners(): Record<'new-learner' | 'noor', LearnerState> {
  return {
    'new-learner': { onboarded: false, enrolled: ['life-skills', 'hospitality'], progress: {} },
    // Noor has finished LS01-LS06, so the LS02, LS04 and LS06 badges show as earned.
    // Her next step is LS07.
    noor: {
      onboarded: true,
      enrolled: ['life-skills', 'hospitality'],
      progress: {
        LS01: doneUnit('A'),
        LS02: doneUnit('A'),
        LS03: doneUnit('A'),
        LS04: doneUnit('A'),
        LS05: doneUnit('A'),
        LS06: doneUnit('A'),
      },
      lastLocation: { unitId: 'LS07', step: 'media' },
      lastProgramme: 'life-skills',
    },
  }
}

/** Seed dates are marked Demo; shown in UAE time (brief §2 Sessions, §9 Sessions editor). */
export function seedSessions(): LiveSession[] {
  return [
    {
      id: 'ses-ls-upcoming',
      programmeId: 'life-skills',
      title: {
        en: 'Life Skills live session: Stop Think Do',
        ar: 'جلسة مباشرة للمهارات الحياتية: توقّف، فكّر، افعل',
      },
      startsAt: '2026-11-12T12:00:00.000Z',
      timezone: 'Asia/Dubai',
      accessLink: 'https://zoom.us/j/demo-life-skills',
      attendanceStatus: 'upcoming',
      recordingStatus: 'pending',
      demo: true,
    },
    {
      id: 'ses-hf-upcoming',
      programmeId: 'hospitality',
      title: {
        en: 'Hospitality live session: A warm welcome',
        ar: 'جلسة مباشرة للضيافة: ترحيب لطيف',
      },
      startsAt: '2026-11-13T12:00:00.000Z',
      timezone: 'Asia/Dubai',
      accessLink: 'https://zoom.us/j/demo-hospitality',
      attendanceStatus: 'upcoming',
      recordingStatus: 'pending',
      demo: true,
    },
    {
      id: 'ses-ls-past',
      programmeId: 'life-skills',
      title: {
        en: 'Life Skills live session: Healthy communication',
        ar: 'جلسة مباشرة للمهارات الحياتية: التواصل الصحي',
      },
      startsAt: '2026-11-04T12:00:00.000Z',
      timezone: 'Asia/Dubai',
      accessLink: 'https://zoom.us/j/demo-life-skills-past',
      attendanceStatus: 'attended',
      recordingStatus: 'pending',
      demo: true,
    },
  ]
}

export function seedSupportRequests(): SupportRequest[] {
  return [
    {
      id: 'sr-1',
      topic: 'signing-in',
      message: 'Demo request: help signing in.',
      createdAt: '2026-11-05T07:10:00.000Z',
      status: 'open',
      learnerId: 'L-07',
    },
    {
      id: 'sr-2',
      topic: 'lesson',
      message: 'Demo request: help with a lesson.',
      createdAt: '2026-11-06T09:30:00.000Z',
      status: 'open',
      learnerId: 'L-15',
    },
    {
      id: 'sr-3',
      topic: 'live-session',
      message: 'Demo request: help joining a live session.',
      createdAt: '2026-11-06T13:45:00.000Z',
      status: 'open',
      learnerId: 'L-22',
    },
  ]
}
