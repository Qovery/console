import { Toaster, toast as sonnerToast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import { type ToastStatus } from '../../utils/toast'
import Button from '../button/button'
import { Icon } from '../icon/icon'

export interface ToastProps {
  status: ToastStatus
  title?: string
  description?: string
  callback?: () => void
  actionLabel?: string
}

export interface ToastActionProps {
  label: string
  onClick?: () => void
}

export interface CustomToastProps {
  id: string | number
  status: ToastStatus
  title: string
  description?: string
  action?: ToastActionProps
}

const statusIcon: Record<
  ToastStatus,
  { iconName: 'circle-check' | 'circle-xmark' | 'triangle-exclamation'; className: string }
> = {
  success: { iconName: 'circle-check', className: 'text-positive' },
  error: { iconName: 'circle-xmark', className: 'text-negative' },
  warning: { iconName: 'triangle-exclamation', className: 'text-warning' },
}

export function CustomToast({ id, status, title, description, action }: CustomToastProps) {
  const onActionClick = () => {
    sonnerToast.dismiss(id)
    action?.onClick?.()
  }

  return (
    <div className="relative w-full rounded-lg border border-neutral bg-surface-neutral p-3 font-sans shadow-sm">
      <Button
        type="button"
        size="xs"
        variant="plain"
        color="neutral"
        iconOnly
        aria-label="Close toast"
        className="absolute right-2 top-2.5 text-neutral-subtle hover:bg-transparent hover:text-neutral"
        onClick={() => sonnerToast.dismiss(id)}
      >
        <Icon iconName="xmark" iconStyle="regular" />
      </Button>
      <div className="pr-7">
        <p className="flex items-center gap-1.5 text-ssm font-medium text-neutral">
          <Icon
            iconStyle="regular"
            iconName={statusIcon[status].iconName}
            className={twMerge(statusIcon[status].className)}
          />
          {title}
        </p>
        {description && <p className="mt-0.5 text-ssm text-neutral-subtle">{description}</p>}
        {action?.label && (
          <Button type="button" size="sm" variant="surface" color="neutral" className="mt-2.5" onClick={onActionClick}>
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}

export function ToastBehavior() {
  return <Toaster position="top-right" className="!font-sans" gap={8} />
}

export default ToastBehavior
