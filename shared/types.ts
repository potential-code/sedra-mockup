/**
 * Shared types: the contract between content, store and UI. Framework-free.
 * Source of truth for content: docs/brief.txt (Rawzaba's brief, 7 Nov 2026).
 */

export type Lang = 'en' | 'ar'

/** Every learner-visible string exists in both languages (brief §4). */
export interface Localized {
  en: string
  ar: string
}

export type ProgrammeId = 'life-skills' | 'hospitality'
export type CourseId = 'healthy-communication' | 'intro-hospitality'

export type LifeSkillsUnitId = 'LS01' | 'LS02' | 'LS03' | 'LS04' | 'LS05' | 'LS06' | 'LS07' | 'LS08'
export type HospitalityUnitId =
  | 'HF01'
  | 'HF02'
  | 'HF03'
  | 'HF04'
  | 'HF05'
  | 'HF06'
  | 'HF07'
  | 'HF08'
export type UnitId = LifeSkillsUnitId | HospitalityUnitId

export type OptionId = 'A' | 'B' | 'C'

/** One 7.5-second storyboard scene (brief §5: four scenes = 30 s). */
export interface Scene {
  /** e.g. "0–7.5 s" */
  time: string
  /** Exact narration; English is verbatim from the brief. */
  narration: Localized
  /** On-screen text. */
  onScreen: Localized
  /** Visual direction, used as the storyboard image description. */
  visual: Localized
}

export interface KnowledgeCheck {
  question: Localized
  options: { id: OptionId; text: Localized }[]
  correct: OptionId
  feedbackCorrect: Localized
  feedbackRetry: Localized
}

export interface Practice {
  /** Practical activity text from the brief. */
  prompt: Localized
  /** Optional button choices (never drag-and-drop; brief §3 Checks). */
  choices?: Localized[]
  /** Learner may pick several choices (e.g. LS05 "Choose two"). */
  multiple?: boolean
}

/** Produced sample video assets (LS02, HF01, English only). Paths are relative to public/. */
export interface VideoAsset {
  video: string
  captions: string
  transcript: string
  descriptiveTranscript: string
  poster: string
  posterAlt: Localized
  version: string
}

export type MediaStatus = 'sample' | 'pending'

export interface Unit {
  id: UnitId
  courseId: CourseId
  programmeId: ProgrammeId
  /** 1..8 within the course */
  order: number
  title: Localized
  objective: Localized
  /** e.g. "Life Skills pp 5 and 11" */
  sourcePages: string
  durationSeconds: 30
  /** 'sample' = LS02/HF01 produced by Vera; 'pending' = "Video being prepared". */
  mediaStatus: MediaStatus
  /** Only English sample video exists; Arabic shows the pending panel + Arabic storyboard. */
  media?: { en?: VideoAsset }
  scenes: Scene[]
  /** Accessible summary = simplified text alternative. */
  summary: Localized
  check: KnowledgeCheck
  practice: Practice
  /** Storyboard still (relative to public/), shown on pending-video panel and cards. */
  image: string
  imageAlt: Localized
  /** Life Skills milestone badge earned after this unit (LS02, LS04, LS06, LS08). */
  badge?: Localized
}

export interface Course {
  id: CourseId
  programmeId: ProgrammeId
  title: Localized
  programmeTitle: Localized
  purpose: Localized
  unitIds: UnitId[]
  image: string
  imageAlt: Localized
}

export interface ExternalResource {
  id: 'EXT01'
  title: Localized
  courseId: CourseId
  originalUrl: string
  embedUrl: string
  fallbackLabel: Localized
  reviewStatus: 'pending-review'
}

/* ---------- Learner progress (saved locally, demo only) ---------- */

export type UnitStep = 'media' | 'check' | 'practice'
export type PracticeStatus = 'done' | 'later' | 'with-help'

export interface UnitProgress {
  /** Watched video OR read the lesson/storyboard (equal routes, brief §4). */
  watchedOrRead: boolean
  /** Learner has seen feedback for the check (correct or not). */
  checkReviewed: boolean
  /** Recorded separately from completion. */
  checkOutcome?: 'correct' | 'incorrect'
  selected?: OptionId
  attempts: number
  practice?: PracticeStatus
  practiceChoices?: number[]
}

export interface LastLocation {
  unitId: UnitId
  step: UnitStep
}

/* ---------- Preferences (brief §2 /preferences, §3 Preferences) ---------- */

export type TextSize = 100 | 125 | 150
export interface Prefs {
  lang: Lang
  view: 'standard' | 'simplified'
  textSize: TextSize
  contrast: 'standard' | 'high'
  captions: boolean
  /** 'system' follows prefers-reduced-motion. */
  reducedMotion: 'system' | 'on' | 'off'
  /** Optional, learner-initiated read-aloud (simulated in the mockup). */
  readAloud: boolean
}

/* ---------- Demo personas ---------- */

export type PersonaId = 'new-learner' | 'noor' | 'admin'
export type Role = 'learner' | 'admin'

export interface Persona {
  id: PersonaId
  role: Role
  name: Localized
  description: Localized
  /** Route opened after choosing the card. */
  home: '/preferences' | '/learn' | '/admin'
  avatar: string
}

export interface LearnerState {
  onboarded: boolean
  progress: Partial<Record<UnitId, UnitProgress>>
  lastLocation?: LastLocation
  lastProgramme?: ProgrammeId
  /** LS08 reminder (pause card + communication card). */
  playbook?: { pause?: number; message?: number; saved: boolean }
  /** HF08 practice plan. */
  practicePlan?: { action?: number; status?: 'planned' | 'done' | 'later' | 'with-help' }
}

/* ---------- Sessions, support, admin (all fictional, labelled Demo) ---------- */

export interface LiveSession {
  id: string
  programmeId: ProgrammeId
  title: Localized
  /** ISO string; displayed in UAE time (Asia/Dubai). */
  startsAt: string
  timezone: 'Asia/Dubai'
  accessLink: string
  attendanceStatus: 'upcoming' | 'attended' | 'not-attended'
  recordingStatus: 'pending' | 'available'
  demo: true
}

export interface SupportRequest {
  id: string
  topic: 'signing-in' | 'lesson' | 'live-session'
  message: string
  createdAt: string
  status: 'open' | 'closed'
  learnerId?: string
}

export interface AdminLearner {
  id: string
  name: string
  programmes: ProgrammeId[]
  /** Units completed per course (0..8). */
  unitsCompleted: Partial<Record<CourseId, number>>
  /** ISO, shown in UAE time. */
  latestActivity: string
  checksReviewed: number
  checksCorrectFirstTry: number
  practice: { done: number; later: number; withHelp: number }
  supportFlag: boolean
}

export interface ContentDraft {
  unitId: UnitId
  language: Lang
  fields: Record<string, string>
  reviewStatus: 'draft' | 'in-review' | 'approved'
  updatedAt: string
}
