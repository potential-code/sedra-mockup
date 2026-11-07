import { useEffect, useState } from 'react'

/**
 * One polite live region for the whole app (brief §3 Screen reader: announce progress and
 * feedback politely, once). Call announce('...') from anywhere.
 */
let push: ((msg: string) => void) | null = null

export function announce(message: string) {
  push?.(message)
}

export function LiveRegion() {
  const [msg, setMsg] = useState('')
  useEffect(() => {
    push = (m) => {
      setMsg('')
      // Re-set on next frame so the same message is announced again when repeated.
      requestAnimationFrame(() => setMsg(m))
    }
    return () => {
      push = null
    }
  }, [])
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {msg}
    </div>
  )
}
