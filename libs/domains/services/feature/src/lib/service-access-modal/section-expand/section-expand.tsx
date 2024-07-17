import clsx from 'clsx'
import { type PropsWithChildren, useState } from 'react'
import { Icon } from '@qovery/shared/ui'

export interface SectionExpandProps extends PropsWithChildren {
  title: string
  description: string
}

// TODO: update it with Accordion component
export function SectionExpand({ title, description, children }: SectionExpandProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded border border-neutral-250 text-sm">
      <div
        className={clsx(
          'flex cursor-pointer items-center justify-between gap-5 px-4 py-3 transition-colors hover:bg-neutral-100',
          {
            'border-b border-neutral-250': isOpen,
          }
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col gap-1.5">
          <span className="font-medium">{title}</span>
          <p className="text-neutral-350">{description}</p>
        </div>
        <button className="flex h-5 w-5 items-center justify-center">
          <Icon iconName={isOpen ? 'chevron-up' : 'chevron-down'} className="text-sm" />
        </button>
      </div>
      {isOpen && children}
    </div>
  )
}

export default SectionExpand
