import { type CustomDomainProblemResponse } from 'qovery-typescript-axios'

// The console's HTTP interceptor rejects with `{ message, response }` instead of an AxiosError: read the body from either.
export function getCustomDomainProblem(error: unknown): CustomDomainProblemResponse | undefined {
  if (!error || typeof error !== 'object' || !('response' in error)) return undefined
  const response = error.response as { data?: unknown } | undefined
  return response?.data && typeof response.data === 'object'
    ? (response.data as CustomDomainProblemResponse)
    : undefined
}
