import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type SerializedError } from '@qovery/shared/utils'
import toast, { ToastEnum } from './toast'

export function toastError(
  error: SerializedError | Error,
  title?: string,
  description?: string,
  callback?: () => void,
  iconAction?: IconName,
  labelAction?: string,
  externalLink?: string
): void {
  toast(
    ToastEnum.ERROR,
    title || error.name || 'Error',
    description || error.message || 'No message found',
    callback,
    iconAction,
    labelAction,
    externalLink
  )
}
