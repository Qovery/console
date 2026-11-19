import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type AwsMarketplaceOfferRequestInput, BillingError } from '@qovery/shared/billing-kit'
import { usePricingClient } from '../use-pricing-client/use-pricing-client'

export const awsMarketplaceQueryKey = (organizationId: string) =>
  ['pricingApi', 'awsMarketplace', organizationId] as const

export function useAwsMarketplace({ organizationId, enabled = true }: { organizationId: string; enabled?: boolean }) {
  const client = usePricingClient()

  return useQuery({
    queryKey: awsMarketplaceQueryKey(organizationId),
    queryFn: () => client.awsMarketplace(organizationId),
    enabled: enabled && Boolean(organizationId),
    // 4xx answers (not a billing role, not a member) do not change by retrying
    retry: (failureCount, error) => !(error instanceof BillingError && error.status < 500) && failureCount < 2,
    refetchOnWindowFocus: false,
  })
}

export function useRequestAwsMarketplaceOffer({ organizationId }: { organizationId: string }) {
  const client = usePricingClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AwsMarketplaceOfferRequestInput) => client.requestAwsMarketplaceOffer(organizationId, input),
    onSuccess(awsMarketplace) {
      queryClient.setQueryData(awsMarketplaceQueryKey(organizationId), awsMarketplace)
    },
  })
}
