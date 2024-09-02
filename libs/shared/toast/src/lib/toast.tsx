import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type Toast, toast as toastAction } from 'react-hot-toast'
import { ToastContent } from '@qovery/shared/ui'

export enum ToastEnum {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
}

export const toast = (
  status: ToastEnum | keyof typeof ToastEnum,
  title: string,
  description?: string,
  callback?: () => void,
  iconAction?: IconName,
  labelAction?: string,
  externalLink?: string
) => {
  return toastAction.success((options: Toast) =>
    ToastContent(status, options, title, description, callback, iconAction, labelAction, externalLink)
  )
}

export default toast
