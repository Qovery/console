import toast, { ToastEnum } from '../toast'

export function errorToaster(error: any, title?: string, message?: string): void {
  toast(
    ToastEnum.ERROR,
    title || error.response?.data?.error || error.code || 'Error',
    message || error.response?.data?.message || error.message
  )
}
