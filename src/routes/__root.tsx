import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { MotionConfig } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { SkipLink } from '@/components/layout/SkipLink'
import { LiveRegion } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { usePrefs } from '@/store/actions'

function Root() {
  const reduce = useReducedMotion()
  const { lang } = usePrefs()
  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'never'}>
      <SkipLink />
      <Outlet />
      <LiveRegion />
      <Toaster position="top-center" closeButton dir={lang === 'ar' ? 'rtl' : 'ltr'} />
    </MotionConfig>
  )
}

function NotFound() {
  const { t } = useTranslation()
  return (
    <main id="main" tabIndex={-1} className="container-page py-16">
      <h1 className="text-3xl">{t('notFound.title')}</h1>
      <p>{t('notFound.body')}</p>
      <Button asChild>
        <Link to="/">{t('notFound.home')}</Link>
      </Button>
    </main>
  )
}

export const Route = createRootRoute({ component: Root, notFoundComponent: NotFound })
