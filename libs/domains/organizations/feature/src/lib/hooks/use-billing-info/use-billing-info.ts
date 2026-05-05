import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseBillingInfoProps {
  organizationId: string
  suspense?: boolean
}

export function useBillingInfo({ organizationId, suspense = false }: UseBillingInfoProps) {
  return useQuery({
    ...queries.organizations.billingInfo({ organizationId }),
    suspense,
  })
}

export default useBillingInfo
