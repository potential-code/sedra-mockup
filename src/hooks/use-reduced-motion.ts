import { useEffect, useState } from 'react'
import { usePrefs } from '@/store/actions'

/** True when the device asks for reduced motion or the learner turned motion off. */
export function useReducedMotion(): boolean {
  const { reducedMotion } = usePrefs()
  const [system, setSystem] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setSystem(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  // Brief §3: respect system reduced motion. The device setting always wins; the learner
  // preference can only add 'reduce', never override the device.
  if (system) return true
  return reducedMotion === 'on'
}
