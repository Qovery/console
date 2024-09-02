import { type IconName } from '@fortawesome/fontawesome-common-types'
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
  iconAction?: IconName,
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
    <div
      data-testid="toast"
      className="group relative cursor-pointer rounded bg-neutral-900 shadow-[0_16px_24px_rgba(0,0,0,0.12)]"
      onClick={() => options && toastAction.dismiss(options.id)}
    >
      <div className="flex">
        <div className="mt-[1px] flex h-full justify-center pl-4 pt-2">
          {status === ToastEnum.SUCCESS && <Icon name="icon-solid-check" className="text-green-500" />}
          {status === ToastEnum.ERROR && <Icon name="icon-solid-circle-exclamation" className="text-red-500" />}
          {status === ToastEnum.WARNING && <Icon name="icon-solid-circle-exclamation" className="text-yellow-500" />}
        </div>
        <div className="max-w-[256px] break-words py-2 pl-3 pr-4">
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
              <Icon iconName={iconAction} className="text-sm text-white" />
            ) : (
              <Icon iconName="gear" className="text-sm text-white" />
            )}
          </div>
        )}

        {options && (
          <button
            className="absolute left-[-8px] top-[-8px] flex h-6 w-6 items-center justify-center rounded-full border border-neutral-400 bg-neutral-600 text-white opacity-0 duration-150 ease-out hover:bg-neutral-700 group-hover:opacity-100"
            onClick={() => toastAction.dismiss(options.id)}
          >
            <Icon iconName="xmark" className="text-sm" />
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
