import { Check, CheckCircle2 } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

/** "I have watched / I have read this" action that turns into a saved status once done. */
export function DoneControl({
  done,
  onDone,
  doneText,
  actionText,
}: {
  done: boolean
  onDone: () => void
  doneText: string
  actionText: string
}) {
  const reduce = useReducedMotion()
  if (done) {
    return (
      <motion.p
        initial={reduce ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="m-0 flex items-center gap-3 self-start rounded-2xl bg-success-soft px-4 py-3 font-semibold text-success ring-1 ring-success/30"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success text-white">
          <Check aria-hidden="true" className="size-5" strokeWidth={3} />
        </span>
        {doneText}
      </motion.p>
    )
  }
  return (
    <Button type="button" variant="outline" className="self-start" onClick={onDone}>
      <CheckCircle2 aria-hidden="true" />
      {actionText}
    </Button>
  )
}
