import { type PropsWithChildren } from 'react'
import { twMerge } from '@qovery/shared/util-js'

export interface EmptyStateProps extends PropsWithChildren {
  title: string
  description?: string
  className?: string
}

export function EmptyState({ title, description, className, children }: EmptyStateProps) {
  return (
    <div className={twMerge('flex flex-grow items-center justify-center', className)}>
      <div className="text-center flex flex-col items-center justify-center w-[420px] m-auto mt-12">
        <img
          className="pointer-events-none user-none mb-4 w-[170px]"
          src="/assets/images/event-placeholder-light.svg"
          alt="Event placeholder"
        />
        <p className="text-neutral-400 font-medium">{title}</p>
        {description && <p className="text-sm text-neutral-350 mt-1">{description}</p>}
        {children}
      </div>
    </div>
  )
}

export default EmptyState
