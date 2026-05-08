import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { Icon } from '../icon/icon'

export type SyncStatus = 'synced' | 'syncing' | 'broken' | 'detached'

const syncStatusBadgeVariants = cva(
  [
    'inline-flex',
    'items-center',
    'gap-1',
    'rounded-md',
    'border',
    'px-1.5',
    'h-6',
    'text-xs',
    'font-medium',
    'shrink-0',
  ],
  {
    variants: {
      status: {
        synced: ['border-positive-subtle', 'bg-surface-positive-subtle', 'text-positive'],
        syncing: ['border-info-subtle', 'bg-surface-info-subtle', 'text-info'],
        broken: ['border-negative-subtle', 'bg-surface-negative-subtle', 'text-negative'],
        detached: ['border-neutral', 'bg-surface-neutral-subtle', 'text-neutral-subtle'],
      },
    },
    defaultVariants: {
      status: 'synced',
    },
  }
)

export interface SyncStatusBadgeProps
  extends Omit<ComponentPropsWithoutRef<'span'>, 'color'>,
    VariantProps<typeof syncStatusBadgeVariants> {
  status: SyncStatus
}

const statusConfig: Record<SyncStatus, { label: string; iconName: IconName }> = {
  synced: { label: 'Synced', iconName: 'check-circle' },
  syncing: { label: 'Syncing...', iconName: 'spinner-third' },
  broken: { label: 'Broken', iconName: 'circle-exclamation' },
  detached: { label: 'Detached', iconName: 'link-slash' },
}

export const SyncStatusBadge = forwardRef<ElementRef<'span'>, SyncStatusBadgeProps>(function SyncStatusBadge(
  { className, status, ...props },
  forwardedRef
) {
  const { label, iconName } = statusConfig[status]

  return (
    <span ref={forwardedRef} className={twMerge(syncStatusBadgeVariants({ status }), className)} {...props}>
      <Icon
        iconName={iconName}
        iconStyle="regular"
        className={twMerge('text-[10px]', status === 'syncing' && 'animate-spin')}
      />
      {label}
    </span>
  )
})

export default SyncStatusBadge
