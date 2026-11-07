import type { ReactNode } from 'react'
import { usePageTitle } from '@/hooks/use-page-title'

/** The one h1 per screen, with a short lead sentence; also sets document.title. */
export function PageHeading({
  title,
  pageTitle,
  lead,
  children,
}: {
  title: string
  pageTitle?: string
  lead?: string
  children?: ReactNode
}) {
  usePageTitle(pageTitle ?? title)
  return (
    <div className="grid grid-cols-1 gap-3">
      <h1 className="m-0 text-3xl break-words md:text-4xl">{title}</h1>
      {lead ? <p className="m-0 text-lg text-ink">{lead}</p> : null}
      {children}
    </div>
  )
}
