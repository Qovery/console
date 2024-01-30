import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseBillingInfoProps {
  organizationId: string
}

export function useBillingInfo({ organizationId }: UseBillingInfoProps) {
  return useQuery({
    ...queries.organizations.billingInfo({ organizationId }),
  })
}

export default useBillingInfo
