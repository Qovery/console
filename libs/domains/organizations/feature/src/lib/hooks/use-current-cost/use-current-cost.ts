import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseCurrentCostProps {
  organizationId: string
  enabled?: boolean
  suspense?: boolean
}

export function useCurrentCost({ organizationId, enabled = true, suspense = false }: UseCurrentCostProps) {
  return useQuery({
    ...queries.organizations.currentCost({ organizationId }),
    enabled,
    suspense,
  })
}

export default useCurrentCost
