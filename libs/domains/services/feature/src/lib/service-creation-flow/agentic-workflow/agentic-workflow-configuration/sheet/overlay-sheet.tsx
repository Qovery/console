import { type ReactNode, useEffect } from 'react'
import { Button, Heading, Icon, Section, Sheet } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

export function OverlaySheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  // Lock the page scroll while the sheet is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <div className="fixed inset-0 z-modal flex justify-end bg-background-overlay" onClick={onClose}>
      <div className="h-full" onClick={(event) => event.stopPropagation()}>
        <Sheet
          open
          role="dialog"
          aria-modal
          className="w-[520px] max-w-[calc(100vw-24px)] shadow-none"
          onClose={onClose}
        >
          {children}
        </Sheet>
      </div>
    </div>
  )
}

export function SheetHeader({
  className,
  description,
  onClose,
  title,
}: {
  className?: string
  description?: ReactNode
  onClose: () => void
  title: string
}) {
  return (
    <div className={twMerge('flex items-start justify-between gap-4 px-5 pb-4 pt-5', className)}>
      <Section className="min-w-0 gap-1">
        <Heading level={2} className="text-xl font-medium leading-7 text-neutral">
          {title}
        </Heading>
        {description ? <p className="max-w-[440px] text-sm leading-5 text-neutral-subtle">{description}</p> : null}
      </Section>
      <Button type="button" variant="plain" color="neutral" size="xs" iconOnly aria-label="Close" onClick={onClose}>
        <Icon iconName="xmark" />
      </Button>
    </div>
  )
}
