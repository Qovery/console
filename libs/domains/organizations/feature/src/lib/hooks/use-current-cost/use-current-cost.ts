import { useQuery, useQueryClient } from '@tanstack/react-query'
import { isForbiddenError } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'

export interface UseCurrentCostProps {
  organizationId: string
  enabled?: boolean
  suspense?: boolean
}

export function useCurrentCost({ organizationId, enabled = true, suspense = false }: UseCurrentCostProps) {
  const queryClient = useQueryClient()
  const currentCostQuery = queries.organizations.currentCost({ organizationId })
  // `retryOnMount` only accepts a boolean, so it is resolved from the cached error when the observer mounts
  const isForbidden = isForbiddenError(queryClient.getQueryState(currentCostQuery.queryKey)?.error)

  return useQuery({
    ...currentCostQuery,
    enabled,
    suspense,
    // A 403 means the member has no MANAGE_BILLING permission. It won't change during the session,
    // and this query is mounted on every organization page (free trial banner), so never refetch it.
    retry: (failureCount, error) => !isForbiddenError(error) && failureCount < 2,
    retryOnMount: !isForbidden,
    refetchOnWindowFocus: (query) => !isForbiddenError(query.state.error),
    refetchOnReconnect: (query) => !isForbiddenError(query.state.error),
  })
}

export default useCurrentCost
