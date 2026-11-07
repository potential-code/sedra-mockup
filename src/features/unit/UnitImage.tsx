import { ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'

/** Storyboard still. If the file is missing, the description is shown in a labelled panel. */
export function UnitImage({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'flex aspect-video w-full items-center justify-center gap-3 bg-sedra-pale-50 p-4 text-ink',
          className,
        )}
      >
        <ImageIcon aria-hidden="true" className="size-8 shrink-0 text-sedra-green" />
        <span aria-hidden="true" className="max-w-sm">
          {alt}
        </span>
      </div>
    )
  }
  return (
    <img
      src={asset(src)}
      alt={alt}
      onError={() => setFailed(true)}
      className={cn('aspect-video w-full bg-sedra-pale-50 object-cover', className)}
    />
  )
}
