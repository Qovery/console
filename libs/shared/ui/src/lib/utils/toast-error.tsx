import { type SerializedError } from '@qovery/shared/utils'
import toast, { type ToastActionCallback } from './toast'

export function toastError(
  error: SerializedError | Error,
  title?: string,
  description?: string,
  callback?: ToastActionCallback,
  labelAction?: string
): void {
  toast(
    'error',
    title || error.name || 'Error',
    description || error.message || 'No message found',
    callback,
    labelAction
  )
}
