import { type MouseEvent } from 'react'
import { type Toast, Toaster, toast as toastAction } from 'react-hot-toast'
import { ToastEnum } from '../../utils/toast'
import { Icon } from '../icon/icon'

export interface ToastProps {
  options?: Toast
  status: ToastEnum
  title?: string
  description?: string
  callback?: () => void
  actionIcon?: string
  actionLabel?: string
  externalLink?: string
}

export const ToastContent = (
  status: ToastEnum | keyof typeof ToastEnum,
  options?: Toast,
  title?: string,
  description?: string,
  callback?: () => void,
  iconAction?: string,
  labelAction?: string,
  externalLink?: string
) => {
  const onLabelClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()

    if (callback) {
      callback()
    }

    if (externalLink) {
      window.open(externalLink, '_blank')
    }
  }

  return (
    <div data-testid="toast" className="toast" onClick={() => options && toastAction.dismiss(options.id)}>
      <div className="toast__wrapper">
        <div className="toast__icon">
          {status === ToastEnum.SUCCESS && <Icon name="icon-solid-check" className="text-green-500" />}
          {status === ToastEnum.ERROR && <Icon name="icon-solid-circle-exclamation" className="text-red-500" />}
          {status === ToastEnum.WARNING && <Icon name="icon-solid-circle-exclamation" className="text-yellow-500" />}
        </div>
        <div className="toast__content">
          {title && (
            <p data-testid="toast-title" className="font-medium text-white">
              {title}
            </p>
          )}
          {description && (
            <span
              data-testid="toast-description"
              className={`block text-sm font-medium text-neutral-300 ${!labelAction ? 'mb-1' : ''}`}
            >
              {description}
            </span>
          )}

          {labelAction && (
            <button
              data-testid="label-action"
              onClick={(e) => onLabelClick(e)}
              className="-mt-1 mb-1 cursor-pointer text-sm font-medium text-blue-400"
            >
              {labelAction}
            </button>
          )}
        </div>
        {!labelAction && options && callback && (
          <div
            className="flex items-center justify-end rounded-r border-l border-neutral-500 px-4 transition duration-150 ease-in-out hover:bg-neutral-700"
            onClick={() => {
              toastAction.dismiss(options.id)
              callback()
            }}
          >
            {iconAction ? (
              <Icon name={iconAction} className="text-sm text-white" />
            ) : (
              <Icon name="icon-solid-wheel" className="text-sm text-white" />
            )}
          </div>
        )}

        {options && (
          <button className="toast__close" onClick={() => toastAction.dismiss(options.id)}>
            <Icon name="icon-solid-xmark" className="text-sm" />
          </button>
        )}
      </div>
    </div>
  )
}

export function ToastBehavior() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={4}
      toastOptions={{
        duration: 5000,
        style: { background: 'transparent', boxShadow: 'initial', padding: 0 },
        icon: null,
      }}
    />
  )
}

export default ToastBehavior
