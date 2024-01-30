import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseCreditCardsProps {
  organizationId: string
}

export function useCreditCards({ organizationId }: UseCreditCardsProps) {
  return useQuery({
    ...queries.organizations.creditCards({ organizationId }),
  })
}

export default useCreditCards
