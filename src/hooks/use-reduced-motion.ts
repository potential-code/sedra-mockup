import { useEffect, useState } from 'react'
import { usePrefs } from '@/store/actions'

/** True when the learner turned motion off, or (on 'system') the OS asks for reduced motion. */
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
  if (reducedMotion === 'on') return true
  if (reducedMotion === 'off') return false
  return system
}
