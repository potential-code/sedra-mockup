import type { ProgrammeId } from '@shared/types'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BookOpenText,
  Captions,
  CircleHelp,
  ConciergeBell,
  Hand,
  HandHeart,
  Languages,
  Leaf,
  LogIn,
  MessagesSquare,
  TimerOff,
  Type,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import treeWhite from '@/assets/motifs/motif-tree-white.png'
import { findCourse, PROGRAMME_LABEL_KEY } from '@/components/learner/learning'
import { Reveal, stagger } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/use-page-title'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { usePrefs } from '@/store/actions'

const PROGRAMME_BODY: Record<ProgrammeId, 'home.lifeSkillsBody' | 'home.hospitalityBody'> = {
  'life-skills': 'home.lifeSkillsBody',
  hospitality: 'home.hospitalityBody',
}
const PROGRAMME_ICON = { 'life-skills': MessagesSquare, hospitality: ConciergeBell } as const

/** Subtle lift on hover/focus for navigational cards only. Cut by the reduced-motion rules in app.css. */
const lift =
  'transition-[translate,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-pop focus-within:-translate-y-0.5 focus-within:shadow-pop'

/**
 * Public home (brief §2): brief welcome, two programme cards, Sign in, language, accessibility.
 * No carousel. Sections fade in on scroll (Reveal), static under reduced motion.
 */
export function HomePage() {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  usePageTitle(t('home.pageTitle'))
  const simplified = usePrefs().view === 'simplified'
  const reduce = useReducedMotion()

  const steps = [
    { icon: BookOpenText, title: t('home.step1Title'), body: t('home.step1Body') },
    { icon: CircleHelp, title: t('home.step2Title'), body: t('home.step2Body') },
    { icon: HandHeart, title: t('home.step3Title'), body: t('home.step3Body') },
  ]

  const heroChips = [
    { icon: Captions, text: t('home.heroChip') },
    { icon: Languages, text: t('home.accessLanguage') },
    { icon: TimerOff, text: t('home.heroNoTimers') },
  ]

  const access = [
    { icon: Captions, text: t('home.accessCaptions') },
    { icon: Hand, text: t('home.accessButtons') },
    { icon: Type, text: t('home.accessText') },
    { icon: Languages, text: t('home.accessLanguage') },
  ]

  return (
    <div className="[&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words">
      {/* Hero: full-viewport photo background with a SEDRA-green gradient; white text sits on the
          dense side of the gradient (start side; whole photo on mobile). Gradient opacity and the
          text column cap (50vw) keep white text >= 4.5:1 against the brightest photo pixel under it,
          up to 150% text size (measured). Tree mark and bottom fade are decorative. */}
      <section
        aria-labelledby="hero-heading"
        className="relative isolate flex min-h-[calc(100svh-5rem)] items-center overflow-hidden bg-sedra-green-800"
      >
        <motion.img
          src={asset('images/home-hero.webp')}
          alt={t('home.heroAlt')}
          width={1200}
          height={900}
          initial={reduce ? false : { scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 -z-30 size-full object-cover object-[70%_center] rtl:object-[30%_center]"
        />
        {/* Mobile: even wash over the whole photo (text spans the full width). */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-sedra-green-800/85 lg:hidden"
        />
        {/* Desktop: dense behind the text, fading out over the people on the end side. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 hidden bg-gradient-to-r from-sedra-green-800/95 from-45% via-sedra-green-800/80 via-65% to-sedra-green-800/20 lg:block rtl:bg-gradient-to-l"
        />
        {/* Large faint SEDRA tree on the end side, clear of the text (decorative, static). */}
        <img
          src={treeWhite}
          alt=""
          width={676}
          height={464}
          className="pointer-events-none absolute -end-[4vw] bottom-[6%] -z-10 hidden w-[min(44vw,44rem)] opacity-10 lg:block"
        />
        {/* Small tree in the bottom-start corner, inside the bottom padding (pb-32/36), so it never
            overlaps text. Decorative, static. */}
        <img
          src={treeWhite}
          alt=""
          width={676}
          height={464}
          className="pointer-events-none absolute -start-6 -bottom-4 -z-10 h-32 w-auto opacity-15 lg:start-6 lg:h-36"
        />
        {/* Soft fade into the page below (decorative; no text sits in this band). */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 h-20 bg-gradient-to-t from-sedra-green-800/70 to-transparent"
        />
        <div className="mx-auto w-full max-w-[90rem] px-4 pt-16 pb-32 md:px-10 lg:px-16 lg:pt-24 lg:pb-36">
          <div className="grid max-w-2xl grid-cols-1 gap-6 text-white lg:max-w-[min(46rem,50vw)]">
            <Reveal>
              <p className="m-0 inline-flex w-fit items-center gap-2 text-lg font-semibold text-white">
                <Leaf aria-hidden="true" className="size-5" />
                {t('home.eyebrow')}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1
                id="hero-heading"
                className="m-0 text-[2rem] leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl 2xl:text-7xl"
              >
                {t('home.headline')}
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="m-0 max-w-[46ch] text-xl text-white">{t('home.lead')}</p>
            </Reveal>
            <Reveal delay={0.24} className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white text-sedra-green shadow-lg hover:bg-sedra-pale-100"
              >
                <Link to="/welcome">
                  <LogIn aria-hidden="true" className="rtl-mirror" />
                  {t('home.signInCta')}
                </Link>
              </Button>
            </Reveal>
            {/* Promise chips: solid fills (not see-through) so contrast never depends on the photo. */}
            {simplified ? null : (
              <Reveal delay={0.32}>
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {heroChips.map(({ icon: Icon, text }) => (
                    <li
                      key={text}
                      className="flex max-w-none items-center gap-2 rounded-full bg-sedra-green-700 px-4 py-2 text-base font-semibold text-white ring-1 ring-white/30"
                    >
                      <Icon aria-hidden="true" className="size-5 shrink-0" />
                      {text}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* How a lesson works: three numbered steps joined by a line (left to right / right to left). */}
      <section aria-labelledby="how-heading" className="container-page py-10 md:py-14">
        <div className="motif-tree grid gap-8 rounded-3xl bg-white p-6 shadow-md md:p-10">
          <Reveal className="grid max-w-2xl gap-2">
            <h2 id="how-heading" className="m-0 text-3xl md:text-4xl">
              {t('home.howHeading')}
            </h2>
            <p className="m-0 text-lg text-ink-soft">{t('home.howLead')}</p>
          </Reveal>
          <ol className="relative m-0 grid list-none gap-6 p-0 sm:grid-cols-3 sm:gap-5">
            {/* Connector between the step numbers (decorative). */}
            <span
              aria-hidden="true"
              className="absolute inset-x-[16.6%] top-7 hidden h-1 rounded-full bg-sedra-pale sm:block"
            />
            {steps.map(({ icon: Icon, title, body }, i) => (
              <Reveal
                as="li"
                key={title}
                delay={stagger(i, 0.12)}
                className="relative flex max-w-none gap-4 sm:flex-col sm:items-center sm:text-center"
              >
                <span
                  aria-hidden="true"
                  className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full bg-sedra-green text-2xl font-bold text-white ring-8 ring-white"
                >
                  {i + 1}
                </span>
                <span className="grid flex-1 gap-2 rounded-2xl bg-sedra-pale-50 p-5 sm:w-full sm:justify-items-center">
                  <span className="sr-only">{t('home.step', { n: i + 1 })}: </span>
                  <span className="grid size-12 place-items-center rounded-full bg-white text-sedra-green shadow-sm">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <span className="text-xl font-bold text-ink">{title}</span>
                  <span className="text-base text-ink-soft">{body}</span>
                </span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Programmes: photo cards that lift. */}
      <section id="programmes" aria-labelledby="programmes-heading" className="motif-tree">
        <div className="container-page grid gap-6 py-10 md:py-14">
          <Reveal className="grid gap-1">
            <h2 id="programmes-heading" className="m-0 text-2xl md:text-3xl">
              {t('home.programmesHeading')}
            </h2>
            <p className="m-0 text-lg text-ink-soft">{t('home.programmesLead')}</p>
          </Reveal>
          <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-2">
            {(['life-skills', 'hospitality'] as const).map((p, i) => {
              const course = findCourse(p)
              const name = t(`common:${PROGRAMME_LABEL_KEY[p]}`)
              const Icon = PROGRAMME_ICON[p]
              return (
                <Reveal as="li" key={p} delay={stagger(i, 0.12)} className="max-w-none">
                  <article
                    className={`group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-md ${lift}`}
                  >
                    <div className="relative">
                      <div className="overflow-hidden">
                        {course?.image ? (
                          <img
                            src={asset(course.image)}
                            alt={l(course.imageAlt)}
                            width={800}
                            height={500}
                            className="aspect-[16/10] h-auto w-full bg-sedra-pale-50 object-cover"
                          />
                        ) : null}
                      </div>
                      <span className="absolute top-4 start-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-base font-semibold text-ink shadow-sm">
                        <BookOpenText aria-hidden="true" className="size-4 text-sedra-green" />
                        {t('home.units')}
                      </span>
                      <span className="absolute -bottom-8 start-6 grid size-16 place-items-center rounded-2xl bg-sedra-green text-white shadow-lg ring-4 ring-white">
                        <Icon aria-hidden="true" className="size-8" />
                      </span>
                    </div>
                    <div className="grid flex-1 content-start gap-3 p-6 pt-12">
                      <h3 className="m-0 text-2xl">{name}</h3>
                      <p className="m-0">{t(PROGRAMME_BODY[p])}</p>
                      <Link
                        to="/welcome"
                        className="mt-2 inline-flex min-h-12 w-fit items-center gap-2 rounded-xl font-semibold text-sedra-green underline-offset-4 after:absolute after:inset-0 after:content-[''] hover:underline"
                      >
                        {t('home.start', { programme: name })}
                        <ArrowRight aria-hidden="true" className="rtl-mirror size-5" />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </ul>
        </div>
      </section>

      {/* Accessibility promise: dark green band, heading on one side, tiles on the other. */}
      {simplified ? null : (
        <section aria-labelledby="access-heading" className="container-page py-10 md:py-14">
          <Reveal className="motif-tree-light grid gap-8 rounded-3xl bg-sedra-green-800 p-6 text-white shadow-lg md:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-center">
            <div className="grid gap-3">
              <p className="m-0 inline-flex w-fit items-center gap-2 rounded-full bg-sedra-green-700 px-3 py-1 text-base font-semibold text-white">
                <HandHeart aria-hidden="true" className="size-5" />
                {t('home.accessKicker')}
              </p>
              <h2 id="access-heading" className="m-0 text-3xl text-white md:text-4xl">
                {t('home.accessHeading')}
              </h2>
              <p className="m-0 text-lg text-white/90">{t('home.accessNote')}</p>
            </div>
            <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
              {access.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex max-w-none items-center gap-4 rounded-2xl bg-sedra-green-700 p-4 ring-1 ring-white/20"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-sedra-green-800">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <span className="font-semibold text-white">{text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      )}
    </div>
  )
}
