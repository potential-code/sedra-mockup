import { useLocalized } from '@/i18n'

/** Dates in UAE time (Asia/Dubai) for the admin screens (brief §9: display time in UAE time). */
export function useUaeFormat() {
  const { lang } = useLocalized()
  const locale = lang === 'ar' ? 'ar-AE' : 'en-AE'
  const dateTime = new Intl.DateTimeFormat(locale, {
    timeZone: 'Asia/Dubai',
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const date = new Intl.DateTimeFormat(locale, { timeZone: 'Asia/Dubai', dateStyle: 'medium' })
  return {
    dateTime: (iso: string) => dateTime.format(new Date(iso)),
    date: (iso: string) => date.format(new Date(iso)),
    number: (n: number) => new Intl.NumberFormat(locale).format(n),
  }
}

/** Split an ISO instant into UAE-local date (YYYY-MM-DD) and time (HH:mm) for form inputs. */
export function toUaeParts(iso: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso))
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  }
}

/** UAE has no daylight saving: local time is always UTC+04:00. */
export function fromUaeParts(date: string, time: string): string | null {
  const d = new Date(`${date}T${time}:00+04:00`)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}
