import { useQuery } from '@tanstack/react-query'
import { BillingError } from '@qovery/shared/billing/data-access'
import { usePricingClient } from '@qovery/shared/billing/feature'

export type BillingUsageErrorType = 'session-expired' | 'not-a-member' | 'not-linked' | 'unavailable'

const billingUsageQueryKey = (organizationId: string) => ['pricingApi', 'billingUsage', organizationId] as const

export function getBillingUsageErrorType(error: unknown): BillingUsageErrorType {
  if (error instanceof BillingError) {
    if (error.status === 401) return 'session-expired'
    if (error.status === 403) return 'not-a-member'
    if (error.status === 404) return 'not-linked'
  }
  return 'unavailable'
}

export interface UseBillingUsageProps {
  organizationId: string
}

export function useBillingUsage({ organizationId }: UseBillingUsageProps) {
  const client = usePricingClient()

  return useQuery({
    queryKey: billingUsageQueryKey(organizationId),
    queryFn: () => client.billingUsage(organizationId),
    enabled: Boolean(organizationId),
    retry: (failureCount, error) =>
      failureCount < 2 && (!(error instanceof BillingError) || (error.status >= 500 && error.status < 600)),
    refetchOnWindowFocus: false,
  })
}

export default useBillingUsage
