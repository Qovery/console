import { type IconName, type IconStyle } from '@fortawesome/fontawesome-common-types'
import { type VariantProps, cva } from 'class-variance-authority'
import { type PropsWithChildren, type ReactNode } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { Icon } from '../icon/icon'

const emptyStateVariants = cva(['rounded-lg border text-sm'], {
  variants: {
    size: {
      sm: ['flex items-center justify-between gap-4 px-4 py-4'],
      base: ['flex h-56 flex-col items-center justify-center gap-4 p-10 text-center'],
    },
    variant: {
      neutral: ['border-neutral bg-surface-neutral-subtle text-neutral-subtle'],
      positive: ['border-positive-subtle bg-surface-positive-subtle text-positive'],
    },
  },
  defaultVariants: {
    size: 'base',
    variant: 'neutral',
  },
})

const emptyStateIconVariants = cva([], {
  variants: {
    variant: {
      neutral: ['text-neutral-disabled'],
      positive: ['text-positive'],
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
})

const emptyStateIconBackgroundVariants = cva([], {
  variants: {
    variant: {
      neutral: ['fill-surface-neutral-component'],
      positive: ['fill-surface-positive-component'],
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
})

export interface EmptyStateProps extends PropsWithChildren, VariantProps<typeof emptyStateVariants> {
  title: ReactNode
  icon?: IconName | ReactNode
  iconStyle?: IconStyle
  description?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  className,
  icon,
  iconStyle,
  size = 'base',
  variant = 'neutral',
  children,
}: EmptyStateProps) {
  const emptyStateIcon =
    icon &&
    (typeof icon === 'string' ? (
      <span className="relative inline-flex h-10 min-h-10 w-10 min-w-10 items-center justify-center">
        <Icon
          iconName={icon as IconName}
          iconStyle={iconStyle}
          className={twMerge('absolute top-2 text-base', emptyStateIconVariants({ variant }))}
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
            className={emptyStateIconBackgroundVariants({ variant })}
            fill="currentColor"
            d="M0 6a6 6 0 0 1 6-6h28a6 6 0 0 1 6 6v28a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6z"
          ></path>
          <path
            className={emptyStateIconVariants({ variant })}
            stroke="currentColor"
            d="M.5 7V4.5a4 4 0 0 1 4-4H7M39.5 33v2.5a4 4 0 0 1-4 4H33M.5 33v2.5a4 4 0 0 0 4 4H7M39.5 7V4.5a4 4 0 0 0-4-4H33"
          ></path>
        </svg>
      </span>
    ) : (
      icon
    ))

  if (size === 'sm') {
    return (
      <div className={twMerge(emptyStateVariants({ size, variant }), className)}>
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {emptyStateIcon}
          <div className="flex min-w-0 flex-col gap-0.5 text-left">
            <p className="font-medium">{title}</p>
            {description && <p className="max-w-[520px]">{description}</p>}
          </div>
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    )
  }

  return (
    <div className={twMerge(emptyStateVariants({ size, variant }), className)}>
      {emptyStateIcon}

      <div className="flex flex-col gap-1">
        <p className="font-medium">{title}</p>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default EmptyState
