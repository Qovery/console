import { useAuth0 } from '@auth0/auth0-react'
import { useMemo } from 'react'
import { type PricingClient, createPricingClient } from '@qovery/shared/billing/data-access'
import { PRICING_API_URL } from '@qovery/shared/util-node-env'

// Only the calls the console mounts, all to pricing-api with the user's token (core relays none of them).
// Offers wait for customer emails. Email preferences are mounted for Settings → Notifications → Billing.
// Upgrade requests are mounted for the paywall's "Ask an admin" (members asking their admins for a gated feature).
export function pickConsoleCalls(client: PricingClient): PricingClient {
  return {
    mode: client.mode,
    publicPlans: client.publicPlans,
    billingUsage: client.billingUsage,
    spendLimits: client.spendLimits,
    planOptions: client.planOptions,
    quotePlanChange: client.quotePlanChange,
    changePlan: client.changePlan,
    keepPlan: client.keepPlan,
    cancellation: client.cancellation,
    cancel: client.cancel,
    keepSubscription: client.keepSubscription,
    usageHistory: client.usageHistory,
    buildUsage: client.buildUsage,
    credits: client.credits,
    quoteCredits: client.quoteCredits,
    buyCredits: client.buyCredits,
    reactivation: client.reactivation,
    quoteReactivation: client.quoteReactivation,
    reactivate: client.reactivate,
    invoices: client.invoices,
    invoice: client.invoice,
    invoicePdf: client.invoicePdf,
    collectInvoice: client.collectInvoice,
    paymentMethods: client.paymentMethods,
    paymentMethodSession: client.paymentMethodSession,
    billingInfo: client.billingInfo,
    saveBillingInfo: client.saveBillingInfo,
    awsMarketplace: client.awsMarketplace,
    requestAwsOffer: client.requestAwsOffer,
    discounts: client.discounts,
    quoteDiscounts: client.quoteDiscounts,
    requestDiscounts: client.requestDiscounts,
    withdrawDiscountRequest: client.withdrawDiscountRequest,
    gates: client.gates,
    gateEvent: client.gateEvent,
    gateIntro: client.gateIntro,
    trials: client.trials,
    startTrial: client.startTrial,
    setTrialContinue: client.setTrialContinue,
    quoteAddon: client.quoteAddon,
    buyAddon: client.buyAddon,
    requestUpgrade: client.requestUpgrade,
    proposals: client.proposals,
    viewProposal: client.viewProposal,
    snoozeProposal: client.snoozeProposal,
    dismissProposal: client.dismissProposal,
    quoteProposal: client.quoteProposal,
    acceptProposal: client.acceptProposal,
    emailPreferences: client.emailPreferences,
    setEmailPreference: client.setEmailPreference,
  }
}

const pricingClients = new WeakMap<object, { subject?: string; client: PricingClient }>()

export function usePricingClient(): PricingClient {
  const { getAccessTokenSilently, user } = useAuth0()
  const subject = user?.sub
  return useMemo(() => {
    const existing = pricingClients.get(getAccessTokenSilently)
    if (existing && existing.subject === subject) return existing.client
    const client = pickConsoleCalls(
      createPricingClient({
        pricingApiUrl: PRICING_API_URL,
        getToken: () => window.localStorage.getItem('qovery-e2e-auth-token') ?? getAccessTokenSilently(),
      })
    )
    pricingClients.set(getAccessTokenSilently, { subject, client })
    return client
  }, [getAccessTokenSilently, subject])
}
