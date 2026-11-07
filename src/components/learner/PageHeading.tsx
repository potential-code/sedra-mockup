import type { ReactNode } from 'react'
import { usePageTitle } from '@/hooks/use-page-title'
import { cn } from '@/lib/utils'

/**
 * The one h1 per screen, with a short lead sentence; also sets document.title.
 * `tone="inverse"` is for white text on a SEDRA-green panel or green photo scrim.
 */
export function PageHeading({
  title,
  pageTitle,
  lead,
  children,
  tone = 'default',
  className,
}: {
  title: string
  pageTitle?: string
  lead?: string
  children?: ReactNode
  tone?: 'default' | 'inverse'
  className?: string
}) {
  usePageTitle(pageTitle ?? title)
  const inverse = tone === 'inverse'
  return (
    <div className={cn('grid grid-cols-1 gap-3', className)}>
      <h1 className={cn('m-0 text-3xl break-words md:text-4xl', inverse && 'text-white')}>
        {title}
      </h1>
      {lead ? (
        <p className={cn('m-0 text-lg', inverse ? 'text-white' : 'text-ink')}>{lead}</p>
      ) : null}
      {children}
    </div>
  )
}
