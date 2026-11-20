import { useAuth0 } from '@auth0/auth0-react'
import { useMemo } from 'react'
import { type PricingClient, createPricingClient } from '@qovery/shared/billing-kit'
import { PRICING_API_URL } from '@qovery/shared/util-node-env'

// Only the calls the console mounts. Plan changes wait for core's planOptions and planChange routes;
// offers, upgrade requests and email preferences wait for customer emails.
export function pickConsoleCalls(client: PricingClient): PricingClient {
  return {
    mode: client.mode,
    publicPlans: client.publicPlans,
    billingUsage: client.billingUsage,
    spendLimits: client.spendLimits,
    invoices: client.invoices,
    invoicePdf: client.invoicePdf,
    collectInvoice: client.collectInvoice,
    paymentMethods: client.paymentMethods,
    paymentMethodSession: client.paymentMethodSession,
    billingInfo: client.billingInfo,
    saveBillingInfo: client.saveBillingInfo,
    awsMarketplace: client.awsMarketplace,
    requestAwsOffer: client.requestAwsOffer,
  }
}

export function usePricingClient(): PricingClient {
  const { getAccessTokenSilently } = useAuth0()

  return useMemo(
    () =>
      pickConsoleCalls(
        createPricingClient({
          pricingApiUrl: PRICING_API_URL,
          getToken: () => getAccessTokenSilently(),
        })
      ),
    [getAccessTokenSilently]
  )
}

export default usePricingClient
