import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseCreditCardsProps {
  organizationId: string
  enabled?: boolean
  suspense?: boolean
}

export function useCreditCards({ organizationId, enabled = true, suspense = false }: UseCreditCardsProps) {
  return useQuery({
    ...queries.organizations.creditCards({ organizationId }),
    enabled,
    suspense,
  })
}

export default useCreditCards
