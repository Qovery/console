import toast, { ToastEnum } from '../toast'
import { SerializedError } from '@reduxjs/toolkit'

export function toastError(error: SerializedError, title?: string, message?: string): void {
  toast(ToastEnum.ERROR, title || error.name || 'Error', message || error.message || 'No message found')
}
