import { useAuth0 } from '@auth0/auth0-react'
import { useMemo } from 'react'
import { type PricingClient, createPricingClient } from '@qovery/shared/billing-kit'
import { PRICING_API_URL } from '@qovery/shared/util-node-env'

export function usePricingClient(): PricingClient {
  const { getAccessTokenSilently } = useAuth0()

  return useMemo(
    () =>
      createPricingClient({
        pricingApiUrl: PRICING_API_URL,
        getToken: () => getAccessTokenSilently(),
      }),
    [getAccessTokenSilently]
  )
}

export default usePricingClient
