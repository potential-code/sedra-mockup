import { useNavigate } from '@tanstack/react-router'
import { FlaskConical, RotateCcw, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLocalized } from '@/i18n'
import { PERSONAS } from '@/mocks/seed'
import { signInAs, useSession } from '@/store/actions'
import { resetDemo } from '@/store/db'

/** Explicit demo role switch + Reset demo data (brief §1, §2 Admin). */
export function DemoControls() {
  const { t } = useTranslation()
  const { l } = useLocalized()
  const navigate = useNavigate()
  const { personaId } = useSession()
  const [confirm, setConfirm] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <FlaskConical aria-hidden="true" />
            <span>{t('demo.mode')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-64">
          <DropdownMenuLabel>{t('demo.switchUser')}</DropdownMenuLabel>
          {PERSONAS.map((p) => (
            <DropdownMenuItem
              key={p.id}
              className="min-h-12 text-base"
              disabled={p.id === personaId}
              onSelect={() => {
                signInAs(p.id)
                void navigate({ to: p.home })
              }}
            >
              <UserRound aria-hidden="true" />
              {l(p.name)}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="min-h-12 text-base" onSelect={() => setConfirm(true)}>
            <RotateCcw aria-hidden="true" />
            {t('demo.reset')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('demo.resetConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('demo.resetConfirmBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-12">{t('demo.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-12"
              onClick={() => {
                resetDemo()
                toast.success(t('demo.resetDone'))
              }}
            >
              {t('demo.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function DemoBanner() {
  const { t } = useTranslation()
  return (
    <p className="m-0 max-w-none bg-sedra-pale-50 px-4 py-2 text-center text-sm text-ink">
      <strong>{t('demo.label')}:</strong> {t('demo.banner')}
    </p>
  )
}
