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
  Sparkles,
  Type,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { findCourse, PROGRAMME_LABEL_KEY } from '@/components/learner/learning'
import { Reveal } from '@/components/motion/Reveal'
import { LeafBorder, ValuesBand } from '@/components/shared/Motifs'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/use-page-title'
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

/** Public home (brief §2): brief welcome, two programme cards, Sign in, language, accessibility. No carousel. */
export function HomePage() {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  usePageTitle(t('home.pageTitle'))
  const simplified = usePrefs().view === 'simplified'

  const steps = [
    { icon: BookOpenText, title: t('home.step1Title'), body: t('home.step1Body') },
    { icon: CircleHelp, title: t('home.step2Title'), body: t('home.step2Body') },
    { icon: HandHeart, title: t('home.step3Title'), body: t('home.step3Body') },
  ]

  const access = [
    { icon: Captions, text: t('home.accessCaptions') },
    { icon: Hand, text: t('home.accessButtons') },
    { icon: Type, text: t('home.accessText') },
    { icon: Languages, text: t('home.accessLanguage') },
  ]

  return (
    <div className="[&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words">
      {/* Hero: copy on the start side, photo on the end side with floating chips. */}
      <section className="motif-tree bg-gradient-to-b from-white to-background">
        <div className="container-page grid items-center gap-10 py-10 md:py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14 lg:py-16">
          <Reveal className="grid grid-cols-1 content-center gap-6">
            <p className="m-0 inline-flex w-fit items-center gap-2 rounded-full bg-sedra-pale-100 px-4 py-1.5 text-base font-semibold text-sedra-green">
              <Leaf aria-hidden="true" className="size-5" />
              {t('home.eyebrow')}
            </p>
            <h1 className="m-0 text-[1.875rem] leading-[1.15] tracking-tight sm:text-4xl md:text-5xl xl:text-[3.25rem]">
              {t('home.headline')}
            </h1>
            <p className="m-0 max-w-[46ch] text-xl text-ink-soft">{t('home.lead')}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="shadow-md">
                <Link to="/welcome">
                  <LogIn aria-hidden="true" className="rtl-mirror" />
                  {t('home.signInCta')}
                </Link>
              </Button>
            </div>
          </Reveal>

          <div className="relative mx-auto w-full max-w-xl pb-8 lg:max-w-none lg:pb-0">
            {/* Soft offset plate behind the photo for depth (decorative). */}
            <div
              aria-hidden="true"
              className="absolute -inset-y-3 start-6 -end-3 rotate-2 rounded-[2rem] bg-sedra-pale-100 sm:-end-5"
            />
            <Reveal delay={0.1} className="relative">
              <img
                src={asset('images/home-hero.webp')}
                alt={t('home.heroAlt')}
                width={1200}
                height={900}
                className="aspect-[5/4] h-auto w-full rounded-3xl bg-sedra-pale-50 object-cover shadow-pop"
              />
            </Reveal>
            {simplified ? null : (
              <div className="absolute -bottom-2 start-3 sm:-start-6 lg:bottom-8 lg:-start-10">
                <div className="flex items-center gap-3 rounded-2xl bg-white py-3 ps-3 pe-5 shadow-lg">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-sedra-green text-white">
                    <Captions aria-hidden="true" className="size-6" />
                  </span>
                  <span className="grid leading-tight">
                    <span className="font-bold text-ink">{t('home.heroChip')}</span>
                    <span className="text-base text-ink-soft">{t('home.heroChipSub')}</span>
                  </span>
                </div>
              </div>
            )}
            {simplified ? null : (
              <div className="absolute -top-4 end-3 hidden sm:block lg:-end-4">
                <div className="flex items-center gap-3 rounded-2xl bg-white py-2.5 ps-3 pe-4 shadow-lg">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sedra-pale-100 text-sedra-green">
                    <Sparkles aria-hidden="true" className="size-5" />
                  </span>
                  <span className="grid leading-tight">
                    <span className="font-bold text-ink">{t('home.heroStat')}</span>
                    <span className="text-base text-ink-soft">{t('home.heroStatSub')}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How a lesson works: three numbered steps. */}
      <section aria-labelledby="how-heading" className="container-page py-8 md:py-10">
        <div className="rounded-3xl bg-white p-6 shadow-md md:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_1fr] lg:items-center lg:gap-10">
            <div className="grid gap-1">
              <h2 id="how-heading" className="m-0 text-2xl md:text-3xl">
                {t('home.howHeading')}
              </h2>
              <p className="m-0 text-ink-soft">{t('home.howLead')}</p>
            </div>
            <ol className="m-0 grid list-none gap-4 p-0 sm:grid-cols-3">
              {steps.map(({ icon: Icon, title, body }, i) => (
                <li
                  key={title}
                  className="relative flex max-w-none gap-4 rounded-2xl bg-sedra-pale-50 p-4 sm:flex-col sm:gap-3"
                >
                  <span className="relative grid size-14 shrink-0 place-items-center rounded-full bg-sedra-pale-100 text-sedra-green">
                    <Icon aria-hidden="true" className="size-7" />
                    <span
                      aria-hidden="true"
                      className="absolute -top-1.5 -end-1.5 grid size-7 place-items-center rounded-full bg-sedra-green text-base font-bold text-white"
                    >
                      {i + 1}
                    </span>
                  </span>
                  <span className="grid gap-1">
                    <span className="sr-only">{t('home.step', { n: i + 1 })}: </span>
                    <span className="text-lg font-bold text-ink">{title}</span>
                    <span className="text-base text-ink-soft">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Programmes: photo cards that lift. */}
      <section
        id="programmes"
        aria-labelledby="programmes-heading"
        className="container-page grid gap-6 py-8 md:py-10"
      >
        <div className="grid gap-1">
          <h2 id="programmes-heading" className="m-0 text-2xl md:text-3xl">
            {t('home.programmesHeading')}
          </h2>
          <p className="m-0 text-ink-soft">{t('home.programmesLead')}</p>
        </div>
        <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-2">
          {(['life-skills', 'hospitality'] as const).map((p) => {
            const course = findCourse(p)
            const name = t(`common:${PROGRAMME_LABEL_KEY[p]}`)
            const Icon = PROGRAMME_ICON[p]
            return (
              <li key={p} className="max-w-none">
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
              </li>
            )
          })}
        </ul>
      </section>

      {/* Accessibility promise: dark green band, heading on one side, tiles on the other. */}
      {simplified ? null : (
        <section aria-labelledby="access-heading" className="container-page py-8 md:py-10">
          <div className="grid gap-8 rounded-3xl bg-sedra-green-800 p-6 text-white shadow-lg md:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-center">
            <div className="grid gap-3">
              <p className="m-0 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-base font-semibold text-white">
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
                  className="flex max-w-none items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-sedra-green-800">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <span className="font-semibold text-white">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="mt-6">
        <LeafBorder />
        <ValuesBand />
      </div>
    </div>
  )
}
