import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { queries } from '@qovery/state/util-queries'

export interface UseBlueprintUpdateProps {
  blueprintId: string
  enabled?: boolean
  suspense?: boolean
  // Whether a failure is thrown to the nearest error boundary. `suspense` turns this on by default
  // in react-query v4; pass false to keep the failure local to the caller.
  throwOnError?: boolean
}

export function useBlueprintUpdate({
  blueprintId,
  enabled = true,
  suspense = false,
  throwOnError,
}: UseBlueprintUpdateProps) {
  return useQuery({
    ...queries.services.blueprintUpdate({ blueprintId }),
    enabled,
    suspense,
    useErrorBoundary: throwOnError,
    // A 404 means the catalog does not publish this service's tag (prerelease or retired major).
    // That is deterministic, and retrying it only holds the overview on its suspense fallback.
    // Every other failure can be transient, so it gets one quick retry — the default exponential
    // backoff would stall the overview for seconds before it settles on an error.
    retry: (failureCount, error) => (isAxiosError(error) && error.response?.status === 404 ? false : failureCount < 1),
    retryDelay: 500,
  })
}

export default useBlueprintUpdate
