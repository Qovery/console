import { isAxiosError } from 'axios'

export function isHttpStatus(error: unknown, status: number) {
  if (isAxiosError(error)) return error.response?.status === status
  return Boolean(
    error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'status' in error.response &&
      error.response.status === status
  )
}
