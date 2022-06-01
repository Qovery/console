import { ToastContent } from '@console/shared/ui'
import { Toast, toast as toastAction } from 'react-hot-toast'

export enum ToastEnum {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
}

export const toast = (
  status: ToastEnum,
  title: string,
  description?: string,
  linkLabel?: string,
  callback?: () => void
) => {
  return toastAction.success((options: Toast) => ToastContent(status, options, title, description, linkLabel, callback))
}

export default toast
