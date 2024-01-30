import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseCurrentCostProps {
  organizationId: string
}

export function useCurrentCost({ organizationId }: UseCurrentCostProps) {
  return useQuery({
    ...queries.organizations.currentCost({ organizationId }),
  })
}

export default useCurrentCost
