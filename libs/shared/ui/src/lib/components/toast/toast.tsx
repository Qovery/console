import { Icon } from '../icon/icon'
import { toast as toastAction, Toast, Toaster } from 'react-hot-toast'

export enum ToastEnum {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ToastProps {
  options?: Toast
  status: ToastEnum
  title?: string
  description?: string
  linkLabel?: string
  callback?: () => void
}

export const ToastContent = (
  status: ToastEnum,
  options?: Toast,
  title?: string,
  description?: string,
  linkLabel?: string,
  callback?: () => void
) => (
  <div
    data-testid="toast"
    className={`toast toast--${status.toLowerCase()}`}
    onClick={() => options && toastAction.dismiss(options.id)}
  >
    <div className="toast__icon">
      <Icon name={status} width="16px" viewBox="0 0 16 16" pathColor="text-element-dark-600" />
    </div>
    <div className="toast__content">
      {title && (
        <p data-testid="toast-title" className="text-sm text-white mb-1">
          {title}
        </p>
      )}
      {description && (
        <span data-testid="toast-description" className="block text-xs text-element-light-lighter-700">
          {description}
        </span>
      )}
      {options && callback && linkLabel && (
        <div className="flex justify-end items-center mt-2">
          <button
            className="link text-accent2-300 text-xs"
            onClick={() => {
              toastAction.dismiss(options.id)
              callback()
            }}
          >
            {linkLabel}
          </button>
        </div>
      )}
    </div>
    {options && (
      <button
        className="w-6 h-6 flex justify-center items-center absolute top-2 right-2 text-element-light-lighter-700 hover:text-white ease-out duration-300"
        onClick={() => toastAction.dismiss(options.id)}
      >
        <Icon name="icon-solid-xmark" />
      </button>
    )}
  </div>
)

export const toast = (
  status: ToastEnum,
  title: string,
  description?: string,
  linkLabel?: string,
  callback?: () => void
) => {
  return toastAction.success((options: Toast) => ToastContent(status, options, title, description, linkLabel, callback))
}

export function ToastBehavior() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={4}
      toastOptions={{
        duration: 3000,
        style: { background: 'transparent', boxShadow: 'initial', padding: 0 },
        icon: null,
      }}
    />
  )
}

export default ToastBehavior
