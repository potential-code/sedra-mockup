import type { ProgrammeId } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Captions, Hand, Languages, LogIn, Type } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { findCourse, PROGRAMME_LABEL_KEY } from '@/components/learner/learning'
import { PageHeading } from '@/components/learner/PageHeading'
import { Button } from '@/components/ui/button'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'

const PROGRAMME_BODY: Record<ProgrammeId, 'home.lifeSkillsBody' | 'home.hospitalityBody'> = {
  'life-skills': 'home.lifeSkillsBody',
  hospitality: 'home.hospitalityBody',
}

/** Public home (brief §2): brief welcome, two programme cards, Sign in, language, accessibility. No carousel. */
export function HomePage() {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()

  const access = [
    { icon: Languages, text: t('home.accessLanguage') },
    { icon: Type, text: t('home.accessText') },
    { icon: Captions, text: t('home.accessCaptions') },
    { icon: Hand, text: t('home.accessButtons') },
  ]

  return (
    <div className="container-page grid grid-cols-1 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words gap-12 py-8 md:py-12">
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div className="grid grid-cols-1 gap-6">
          <PageHeading
            title={t('home.heading')}
            pageTitle={t('home.pageTitle')}
            lead={t('home.lead')}
          />
          <div className="flex flex-wrap gap-2">
            <Button asChild size="lg">
              <Link to="/welcome">
                <LogIn aria-hidden="true" className="rtl-mirror" />
                {t('home.signInCta')}
              </Link>
            </Button>
          </div>
        </div>
        <img
          src={asset('images/home-hero.webp')}
          alt={t('home.heroAlt')}
          width={1200}
          height={900}
          className="aspect-[4/3] h-auto w-full rounded-2xl bg-sedra-pale-50 object-cover"
        />
      </section>

      <section aria-labelledby="programmes-heading" className="grid grid-cols-1 gap-4">
        <h2 id="programmes-heading" className="m-0 text-2xl">
          {t('home.programmesHeading')}
        </h2>
        <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
          {(['life-skills', 'hospitality'] as const).map((p) => {
            const course = findCourse(p)
            const name = t(`common:${PROGRAMME_LABEL_KEY[p]}`)
            return (
              <li
                key={p}
                className="grid grid-cols-1 content-start gap-4 rounded-2xl border bg-white p-5 shadow-sm"
              >
                {course?.image ? (
                  <img
                    src={asset(course.image)}
                    alt={l(course.imageAlt)}
                    width={800}
                    height={450}
                    className="aspect-video h-auto w-full rounded-xl bg-sedra-pale-50 object-cover"
                  />
                ) : null}
                <h3 className="m-0 text-xl">{name}</h3>
                <p className="m-0">{t(PROGRAMME_BODY[p])}</p>
                <p className="m-0 text-base text-ink-soft">{t('home.units')}</p>
                <Button asChild variant="outline" className="justify-self-start">
                  <Link to="/welcome">
                    {t('home.start', { programme: name })}
                    <ArrowRight aria-hidden="true" className="rtl-mirror" />
                  </Link>
                </Button>
              </li>
            )
          })}
        </ul>
      </section>

      <section
        aria-labelledby="access-heading"
        className="grid grid-cols-1 gap-4 rounded-2xl bg-sedra-pale-50 p-5 md:p-8"
      >
        <h2 id="access-heading" className="m-0 text-2xl">
          {t('home.accessHeading')}
        </h2>
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {access.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <Icon aria-hidden="true" className="mt-1 size-6 shrink-0 text-sedra-green" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <p className="m-0 text-base">{t('home.accessNote')}</p>
      </section>
    </div>
  )
}
