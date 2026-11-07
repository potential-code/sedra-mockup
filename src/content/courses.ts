import type { Course } from '@shared/types'

/**
 * Healthy Communication (Life Skills) and Introduction to Hospitality (Hospitality for All).
 * Purpose lines are drawn from the brief's unit learning objectives (docs/brief.txt §5).
 * Arabic is a draft for SEDRA review; programme titles use the brief §4 label table.
 */
export const COURSES: Course[] = [
  {
    id: 'healthy-communication',
    programmeId: 'life-skills',
    title: { en: 'Healthy Communication', ar: 'التواصل الصحي' },
    programmeTitle: { en: 'Life Skills', ar: 'المهارات الحياتية' },
    purpose: {
      en: 'Learn to share and listen with respect, and to stop, think and do before you respond.',
      ar: 'تعلّم أن تشارك وتستمع باحترام، وأن تتوقّف وتفكّر وتفعل قبل أن تردّ.',
    },
    unitIds: ['LS01', 'LS02', 'LS03', 'LS04', 'LS05', 'LS06', 'LS07', 'LS08'],
    image: 'images/programme-life-skills.webp',
    imageAlt: {
      en: 'Two young women talk calmly, one holding a speech-bubble card.',
      ar: 'شابّتان تتحدّثان بهدوء، وإحداهما تحمل بطاقة فقاعة كلام.',
    },
  },
  {
    id: 'intro-hospitality',
    programmeId: 'hospitality',
    title: { en: 'Introduction to Hospitality', ar: 'مقدمة في الضيافة' },
    programmeTitle: { en: 'Hospitality for All', ar: 'الضيافة للجميع' },
    purpose: {
      en: 'Learn to help people feel welcome, safe and comfortable in everyday places.',
      ar: 'تعلّم أن تساعد الناس على الشعور بالترحيب والأمان والراحة في أماكن الحياة اليومية.',
    },
    unitIds: ['HF01', 'HF02', 'HF03', 'HF04', 'HF05', 'HF06', 'HF07', 'HF08'],
    image: 'images/programme-hospitality.webp',
    imageAlt: {
      en: 'A host at a reception desk welcomes a guest who has just arrived.',
      ar: 'مضيف عند مكتب الاستقبال يرحّب بضيفة وصلت للتوّ.',
    },
  },
]
