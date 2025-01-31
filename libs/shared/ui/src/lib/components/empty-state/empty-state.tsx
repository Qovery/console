import { type PropsWithChildren } from 'react'
import { twMerge } from '@qovery/shared/util-js'

export interface EmptyStateProps extends PropsWithChildren {
  title: string
  description?: string
  className?: string
}

export function EmptyState({ title, description, className, children }: EmptyStateProps) {
  return (
    <div className={twMerge('flex flex-grow animate-fadein items-center justify-center', className)}>
      <div className="m-auto mt-12 flex w-[420px] flex-col items-center justify-center text-center">
        <img
          className="user-none pointer-events-none h-[196px] w-[253px] dark:hidden"
          src="/assets/images/event-placeholder-light.svg"
          alt="Event placeholder"
        />
        <img
          className="user-none pointer-events-none hidden h-[196px] w-[253px] dark:block"
          src="/assets/images/event-placeholder-dark.svg"
          alt="Event placeholder"
        />
        <p className="text-neutral-350 dark:text-neutral-300">{title}</p>
        {description && <p className="mt-1 text-sm text-neutral-350">{description}</p>}
        {children}
      </div>
    </div>
  )
}

export default EmptyState
