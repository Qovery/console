import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseCreditCardsProps {
  organizationId: string
  suspense?: boolean
}

export function useCreditCards({ organizationId, suspense = false }: UseCreditCardsProps) {
  return useQuery({
    ...queries.organizations.creditCards({ organizationId }),
    suspense,
  })
}

export default useCreditCards
