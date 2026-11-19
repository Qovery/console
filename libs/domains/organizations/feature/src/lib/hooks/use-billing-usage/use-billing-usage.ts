import { useQuery } from '@tanstack/react-query'
import { BillingError } from '@qovery/shared/billing-kit'
import { usePricingClient } from '../use-pricing-client/use-pricing-client'

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
    // 401, 403 and 404 will not change by retrying
    retry: (failureCount, error) => getBillingUsageErrorType(error) === 'unavailable' && failureCount < 2,
    refetchOnWindowFocus: false,
  })
}

export default useBillingUsage
