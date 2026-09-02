import { type ReactNode } from 'react'
import { Button, Icon, Sheet } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

export function OverlaySheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-modal flex justify-end bg-background-overlay" onClick={onClose}>
      <div className="h-full" onClick={(event) => event.stopPropagation()}>
        <Sheet open className="w-[520px] max-w-[calc(100vw-24px)] shadow-none" onClose={onClose}>
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
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="text-xl font-medium leading-7 text-neutral">{title}</h2>
        {description ? <p className="max-w-[440px] text-sm leading-5 text-neutral-subtle">{description}</p> : null}
      </div>
      <Button type="button" variant="plain" color="neutral" size="xs" iconOnly aria-label="Close" onClick={onClose}>
        <Icon iconName="xmark" />
      </Button>
    </div>
  )
}
