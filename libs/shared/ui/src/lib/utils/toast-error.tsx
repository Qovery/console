import { type SerializedError } from '@qovery/shared/utils'
import toast, { ToastEnum } from './toast'

export function toastError(error: SerializedError | Error, title?: string, message?: string): void {
  toast(ToastEnum.ERROR, title || error.name || 'Error', message || error.message || 'No message found')
}
