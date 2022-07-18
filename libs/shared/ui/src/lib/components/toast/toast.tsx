import { Icon } from '../icon/icon'
import { toast as toastAction, Toast, Toaster } from 'react-hot-toast'
import { ToastEnum } from '@console/shared/toast'

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
  status: ToastEnum,
  options?: Toast,
  title?: string,
  description?: string,
  callback?: () => void,
  iconAction?: string,
  labelAction?: string,
  externalLink?: string
) => {
  const onLabelClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()

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
          {status === ToastEnum.SUCCESS && <Icon name="icon-solid-check" className="text-success-500" />}
          {status === ToastEnum.ERROR && <Icon name="icon-solid-circle-exclamation" className="text-error-500" />}
          {status === ToastEnum.WARNING && <Icon name="icon-solid-circle-exclamation" className="text-warning-500" />}
        </div>
        <div className="toast__content">
          {title && (
            <p data-testid="toast-title" className="text-sm text-white font-medium">
              {title}
            </p>
          )}
          {description && (
            <span data-testid="toast-description" className="block text-xs text-element-light-lighter-700 my-1">
              {description}
            </span>
          )}
        </div>
        {!labelAction && options && callback && (
          <div
            className="flex justify-end items-center px-4 rounded-r border-l border-element-light-darker-100 transition ease-in-out duration-150 hover:bg-element-light-darker-500"
            onClick={() => {
              toastAction.dismiss(options.id)
              callback()
            }}
          >
            {iconAction ? (
              <Icon name={iconAction} className="text-white text-sm" />
            ) : (
              <Icon name="icon-solid-wheel" className="text-white text-sm" />
            )}
          </div>
        )}

        {options && (
          <button className="toast__close" onClick={() => toastAction.dismiss(options.id)}>
            <Icon name="icon-solid-xmark" className="text-sm" />
          </button>
        )}
      </div>
      {labelAction && (
        <div className="flex px-4 pb-2 justify-end w-full ">
          <button
            data-testid="label-action"
            onClick={(e) => onLabelClick(e)}
            className="cursor-pointer text-blue-400 font-medium text-xs -mt-1"
          >
            {labelAction}
          </button>
        </div>
      )}
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
        duration: 25000,
        style: { background: 'transparent', boxShadow: 'initial', padding: 0 },
        icon: null,
      }}
    />
  )
}

export default ToastBehavior
