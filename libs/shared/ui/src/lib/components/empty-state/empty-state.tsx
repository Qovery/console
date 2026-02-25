import { type IconName, type IconStyle } from '@fortawesome/fontawesome-common-types'
import { type PropsWithChildren, type ReactNode } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { Icon } from '../icon/icon'

export interface EmptyStateProps extends PropsWithChildren {
  title: string
  icon?: IconName | ReactNode
  iconStyle?: IconStyle
  description?: string
  className?: string
}

export function EmptyState({ title, description, className, icon, iconStyle, children }: EmptyStateProps) {
  return (
    <div
      className={twMerge(
        'flex h-56 flex-col items-center justify-center gap-4 rounded-lg border border-neutral bg-surface-neutral-subtle p-10 text-center text-sm text-neutral-subtle',
        className
      )}
    >
      {icon &&
        (typeof icon === 'string' ? (
          <span className="relative inline-flex h-10 min-h-10 w-10 min-w-10 items-center justify-center">
            <Icon
              iconName={icon as IconName}
              iconStyle={iconStyle}
              className="absolute top-2 text-base text-neutral-disabled"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              fill="none"
              viewBox="0 0 40 40"
              className="h-10 w-10"
            >
              <path
                className="fill-surface-neutral-component"
                fill="currentColor"
                d="M0 6a6 6 0 0 1 6-6h28a6 6 0 0 1 6 6v28a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6z"
              ></path>
              <path
                className="text-neutral-disabled"
                stroke="currentColor"
                d="M.5 7V4.5a4 4 0 0 1 4-4H7M39.5 33v2.5a4 4 0 0 1-4 4H33M.5 33v2.5a4 4 0 0 0 4 4H7M39.5 7V4.5a4 4 0 0 0-4-4H33"
              ></path>
            </svg>
          </span>
        ) : (
          icon
        ))}

      <div className="flex flex-col gap-1">
        <p className="font-medium">{title}</p>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default EmptyState
