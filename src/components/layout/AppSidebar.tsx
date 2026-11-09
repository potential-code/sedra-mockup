import { Link, useNavigate } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { LogOut, Menu, X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PreferencesButton } from '@/components/preferences/PreferencesButton'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'
import { signOut, useLearner, useSession } from '@/store/actions'
import { DemoControls } from './DemoControls'
import { LanguageSwitch } from './LanguageSwitch'

export interface SidebarItem {
  key: string
  label: string
  to: string
  params?: Record<string, string>
  icon: LucideIcon
  exact?: boolean
}

/**
 * Desktop sidebar (lg+) on SEDRA dark green, and the same content in a slide-in sheet on smaller
 * screens. Logo is the white version on the dark green.
 */
export function AppSidebar({
  items,
  navLabel,
  homeTo,
  extra,
}: {
  items: SidebarItem[]
  navLabel: string
  homeTo: string
  extra?: ReactNode
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const body = (onNavigate?: () => void) => (
    <div className="motif-tree-light flex min-h-full flex-col gap-5 bg-sedra-green-800 p-4 text-white">
      <Link
        to={homeTo}
        onClick={onNavigate}
        className="self-start rounded-2xl px-1 py-1"
        aria-label={t('nav.home')}
      >
        <Logo variant="white" className="h-28" />
      </Link>

      <nav aria-label={navLabel} className="flex-1">
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {items.map(({ key, label, to, params, icon: Icon, exact }) => (
            <li key={key} className="max-w-none">
              <Link
                to={to}
                params={params as never}
                activeOptions={{ exact: !!exact }}
                onClick={onNavigate}
                className={cn(
                  'group flex min-h-12 items-center gap-3 rounded-xl px-4 font-semibold text-white/90 transition-colors',
                  'hover:bg-white/10 hover:text-white',
                  'aria-[current=page]:bg-white aria-[current=page]:text-sedra-green aria-[current=page]:shadow-md',
                )}
              >
                <Icon aria-hidden="true" className="size-5 shrink-0" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {extra}

      {/* Stacked full-width so no control is clipped in the 18rem column. Solid (not see-through)
          fills keep the faint tree motif out from behind any text. */}
      <div className="grid grid-cols-1 gap-2 [&_button]:w-full [&_button]:justify-center">
        <PreferencesButton />
        <LanguageSwitch />
        <DemoControls />
      </div>

      <UserCard onLoggedOut={onNavigate} />
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 overflow-y-auto lg:block">
        {body()}
      </aside>

      {/* Mobile / tablet top bar with menu */}
      <div className="sticky top-0 z-40 flex items-center gap-2 border-b bg-white px-3 py-2 shadow-sm lg:hidden">
        <Link
          to={homeTo}
          className="me-auto min-w-12 shrink-0 rounded-lg"
          aria-label={t('nav.home')}
        >
          <Logo className="h-14" />
        </Link>
        {/* Language is also inside the menu; hidden here on very narrow screens to avoid overflow. */}
        <div className="hidden min-[400px]:block">
          <LanguageSwitch />
        </div>
        <PreferencesButton iconOnlyNarrow />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label={t('menu')}>
              <Menu aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[min(20rem,90vw)] border-0 p-0 [&>button:last-child]:hidden"
          >
            <SheetTitle className="sr-only">{t('menu')}</SheetTitle>
            <div className="relative h-full">
              <Button
                variant="ghost"
                size="icon"
                className="absolute end-3 top-3 z-10 text-white hover:bg-white/10 hover:text-white"
                aria-label={t('closeMenu')}
                onClick={() => setOpen(false)}
              >
                <X aria-hidden="true" />
              </Button>
              {body(() => setOpen(false))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

function UserCard({ onLoggedOut }: { onLoggedOut?: () => void }) {
  const { t } = useTranslation()
  const { l } = useLocalized()
  const navigate = useNavigate()
  const { persona } = useSession()
  const learner = useLearner()
  if (!persona) return null
  // An invited learner sees their own name (demo); otherwise the persona name.
  const name = (persona.role === 'learner' && learner?.displayName) || l(persona.name)
  return (
    <div className="grid gap-3 rounded-2xl bg-sedra-green p-3 ring-1 ring-white/25">
      <div className="flex items-center gap-3">
        <img
          src={asset(persona.avatar)}
          alt=""
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-full object-cover ring-2 ring-white/60"
        />
        <div className="min-w-0 flex-1">
          <p className="m-0 text-base text-white">{t('signedInAs')}</p>
          <p className="m-0 text-lg font-semibold leading-tight break-words">{name}</p>
        </div>
      </div>
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => {
          signOut()
          onLoggedOut?.()
          void navigate({ to: '/welcome' })
        }}
      >
        <LogOut aria-hidden="true" className="rtl-mirror" />
        {t('logout')}
      </Button>
    </div>
  )
}
