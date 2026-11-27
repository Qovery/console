import { useParams } from '@tanstack/react-router'
import { BillingSettingsPage, InvoicesPage, usePricingClient } from '@qovery/shared/billing/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { SettingsBillingDetails } from '../settings-billing-details/settings-billing-details'
import { SettingsBillingSummary } from '../settings-billing-summary/settings-billing-summary'
import {
  BillingPageLayout,
  useBillingNavigate,
  useIsBillingUsageEnabled,
} from '../settings-billing-usage/settings-billing-usage'

export function InvoicesView() {
  useDocumentTitle('Invoices - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })
  const client = usePricingClient()
  const goTo = useBillingNavigate(organizationId)

  return (
    <BillingPageLayout title="Invoices" description="Every invoice of this organization, to download or pay.">
      <InvoicesPage
        organizationId={organizationId}
        client={client}
        onManagePaymentMethod={() => goTo('billing')}
        onNavigate={goTo}
      />
    </BillingPageLayout>
  )
}

export function BillingSettingsView() {
  useDocumentTitle('Billing - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })
  const client = usePricingClient()
  const goTo = useBillingNavigate(organizationId)

  return (
    <BillingPageLayout title="Billing" description="How you pay, and what your invoices carry.">
      <BillingSettingsPage organizationId={organizationId} client={client} onNavigate={goTo} />
    </BillingPageLayout>
  )
}

// Without the flag, the new URLs show the pages they replace
export function SettingsInvoices() {
  return useIsBillingUsageEnabled() ? <InvoicesView /> : <SettingsBillingSummary />
}

export function SettingsBillingSettings() {
  return useIsBillingUsageEnabled() ? <BillingSettingsView /> : <SettingsBillingDetails />
}
