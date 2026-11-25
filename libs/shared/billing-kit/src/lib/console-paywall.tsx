/*
 * Console only (not in pricing-api's kit): the pricing client the console mounts, and the paywall
 * wiring behind the `billing-paywall` PostHog flag.
 *
 *  - useBillingPaywall(organizationId, { actions }) reads the gates of the actions a page gates
 *    (cluster.create, blueprint.create). With the flag off, nothing is locked.
 *  - <BillingPaywallHost> (mounted once per organization) opens the paywall when an API call fails
 *    with a 402 carrying pricing-api's paywall (offerPaywallFromError, called by the mutation cache):
 *    the full page for a feature with page content (hasGatedPage), the dialog otherwise.
 */
import { useAuth0 } from '@auth0/auth0-react'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PRICING_API_URL } from '@qovery/shared/util-node-env'
import { type PricingClient, createPricingClient } from './client'
import { hasGatedPage } from './gated'
import { GatedPage } from './gated-page'
import { Paywall, usePaywall } from './paywall'
import { gateFor, gateKeyFromBody, isLocked, paywallFromBody } from './rules'
import type { Gate, PaywallInfo } from './types'

export const BILLING_PAYWALL_FEATURE_FLAG = 'billing-paywall'

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

const pricingClients = new WeakMap<object, PricingClient>()

export function usePricingClient(): PricingClient {
  const { getAccessTokenSilently } = useAuth0()
  return useMemo(() => {
    const existing = pricingClients.get(getAccessTokenSilently)
    if (existing) return existing
    const client = pickConsoleCalls(
      createPricingClient({
        pricingApiUrl: PRICING_API_URL,
        getToken: () => window.localStorage.getItem('qovery-e2e-auth-token') ?? getAccessTokenSilently(),
      })
    )
    pricingClients.set(getAccessTokenSilently, client)
    return client
  }, [getAccessTokenSilently])
}

export function useIsBillingPaywallEnabled() {
  return useFeatureFlagEnabled(BILLING_PAYWALL_FEATURE_FLAG) === true
}

type PaywallOptions = NonNullable<Parameters<typeof usePaywall>[3]>

/** The gates of a page's actions, behind the flag: with it off, nothing is locked. */
export function useBillingPaywall(
  organizationId: string,
  keys: { actions?: string[]; skus?: string[] },
  options: PaywallOptions = {}
) {
  const enabled = useIsBillingPaywallEnabled()
  const client = usePricingClient()
  const gated = useMemo(() => (enabled ? client : { ...client, gates: undefined }), [enabled, client])
  const paywall = usePaywall(gated, organizationId, keys, options)
  return enabled ? paywall : { ...paywall, element: null }
}

// ---- a 402 from core with pricing-api's paywall, opened by <BillingPaywallHost>

type PaywallRequest = { paywall?: PaywallInfo; action?: string; sku?: string; onUnavailable?: () => void }
const listeners = new Set<(r: PaywallRequest) => void>()

/**
 * Called by the mutation cache when the plan refuses a call. An embedded paywall can replace
 * the toast immediately. For a gate lookup, the caller can supply a fallback notification.
 */
export function offerPaywallFromError(error: unknown, onUnavailable?: () => void): boolean {
  if (listeners.size === 0) return false
  const e = error as { response?: { status?: number; data?: unknown }; status?: number; code?: string }
  const status = e?.response?.status ?? e?.status ?? (e?.code === '402' ? 402 : undefined)
  if (status !== 402) return false
  const body = e?.response?.data
  const found = paywallFromBody(body)
  const key = gateKeyFromBody(402, body)
  if (!found && !key) return false
  const request: PaywallRequest = found
    ? { paywall: found.paywall, action: found.action, sku: found.sku }
    : { ...key, onUnavailable }
  listeners.forEach((l) => l(request))
  return true
}

/** Mount once in the organization's layout: opens the paywall for a refused API call. */
export function BillingPaywallHost({
  organizationId,
  onContactSales,
}: {
  organizationId: string
  onContactSales?: () => void
}) {
  const enabled = useIsBillingPaywallEnabled()
  const client = usePricingClient()
  const [open, setOpen] = useState<{ paywall?: PaywallInfo; gate?: Gate; action?: string }>()
  const handle = useCallback(
    (r: PaywallRequest) => {
      if (r.paywall) return setOpen({ paywall: r.paywall, action: r.action })
      const key = r.action ?? r.sku
      if (!key || !client.gates) return r.onUnavailable?.()
      client
        .gates(organizationId, r.action ? { actions: [r.action] } : { skus: [r.sku as string] })
        .then((g) => {
          const gate = gateFor(g.gates, key)
          if (isLocked(gate)) setOpen({ gate })
          else r.onUnavailable?.()
        })
        .catch(() => r.onUnavailable?.())
    },
    [client, organizationId]
  )
  useEffect(() => {
    if (!enabled) return
    listeners.add(handle)
    return () => {
      listeners.delete(handle)
    }
  }, [enabled, handle])
  if (!enabled || !open) return null
  // A feature with page content (blueprints, clusters, members, Observe, SSO) gets the full page.
  if (hasGatedPage(open.paywall?.sku ?? open.gate?.sku)) {
    return (
      <GatedPage
        organizationId={organizationId}
        client={client}
        gate={open.gate}
        paywall={open.paywall}
        action={open.action}
        overlay
        onContactSales={onContactSales}
        onClose={() => setOpen(undefined)}
      />
    )
  }
  return (
    <Paywall
      organizationId={organizationId}
      client={client}
      gate={open.gate}
      paywall={open.paywall}
      action={open.action}
      onContactSales={onContactSales}
      onClose={() => setOpen(undefined)}
    />
  )
}
