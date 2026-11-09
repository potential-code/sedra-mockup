import { Link } from '@tanstack/react-router'
import { ArrowRight, PersonStanding, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useSession } from '@/store/actions'
import { PreferenceControls } from './PreferenceControls'

/**
 * One Preferences entry point for every shell (brief §2 "Sign in, language, accessibility").
 * Opens a side panel (Radix dialog: focus trapped, Esc closes, focus returns here) with the same
 * controls as /preferences. Changes apply live, so there is no Save button.
 * `iconOnlyNarrow`: below 400px the visible text is hidden (still the accessible name).
 */
export function PreferencesButton({
  iconOnlyNarrow = false,
  className,
}: {
  iconOnlyNarrow?: boolean
  className?: string
}) {
  const { t, i18n } = useTranslation()
  const { role } = useSession()
  const [open, setOpen] = useState(false)
  // Panel slides in from the end side: right in English, left in Arabic.
  const side = i18n.dir(i18n.language) === 'rtl' ? 'left' : 'right'

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(iconOnlyNarrow && 'max-[399px]:size-12 max-[399px]:px-0', className)}
        >
          <PersonStanding aria-hidden="true" />
          <span className={cn(iconOnlyNarrow && 'max-[399px]:sr-only')}>{t('preferences')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side={side}
        showCloseButton={false}
        className="w-full gap-0 border-0 bg-background p-0 sm:max-w-md"
      >
        <div className="flex items-start gap-3 border-b bg-white p-4">
          <span
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center rounded-full bg-sedra-pale-100 text-sedra-green max-[479px]:hidden"
          >
            <PersonStanding className="size-6" />
          </span>
          <div className="grid min-w-0 flex-1 gap-1">
            <SheetTitle className="m-0 text-xl font-bold text-sedra-green sm:text-2xl">
              {t('preferences')}
            </SheetTitle>
            <SheetDescription className="m-0 flex items-start gap-1.5 text-base font-semibold text-success">
              <Sparkles aria-hidden="true" className="mt-1 size-4 shrink-0" />
              {t('prefsPanel.autoSave')}
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" aria-label={t('prefsPanel.close')}>
              <X aria-hidden="true" />
            </Button>
          </SheetClose>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <PreferenceControls compact />
        </div>

        {role === 'learner' ? (
          <div className="border-t bg-white p-4">
            <Button asChild variant="outline" className="w-full">
              <Link to="/preferences" onClick={() => setOpen(false)}>
                {t('prefsPanel.all')}
                <ArrowRight aria-hidden="true" className="rtl-mirror" />
              </Link>
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
