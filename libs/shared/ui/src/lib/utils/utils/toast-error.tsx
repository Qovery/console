import { SerializedError } from '@reduxjs/toolkit'
import toast, { ToastEnum } from '../toast'

export function toastError(error: SerializedError, title?: string, message?: string): void {
  toast(ToastEnum.ERROR, title || error.name || 'Error', message || error.message || 'No message found')
}
