import { Toast, toast as toastAction } from 'react-hot-toast'
import { ToastContent } from '../components/toast/toast'

export enum ToastEnum {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
}

export const toast = (
  status: ToastEnum,
  title: string,
  description?: string,
  callback?: () => void,
  iconAction?: string,
  labelAction?: string,
  externalLink?: string
) => {
  return toastAction.success((options: Toast) =>
    ToastContent(status, options, title, description, callback, iconAction, labelAction, externalLink)
  )
}

export default toast
