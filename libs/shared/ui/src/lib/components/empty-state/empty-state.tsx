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
      <div className="m-auto mt-12 flex w-[420px] flex-col items-center justify-center text-center">
        <img
          className="user-none pointer-events-none w-[170px]"
          src="/assets/images/event-placeholder-light.svg"
          alt="Event placeholder"
        />
        <p className="font-medium text-neutral-400">{title}</p>
        {description && <p className="mt-1 text-sm text-neutral-350">{description}</p>}
        {children}
      </div>
    </div>
  )
}

export default EmptyState
