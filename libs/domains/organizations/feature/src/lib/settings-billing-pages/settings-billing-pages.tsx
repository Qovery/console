import { useParams } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { BillingAlerts, BillingSettingsPage, InvoicesPage } from '@qovery/shared/billing-kit'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { usePricingClient } from '../hooks/use-pricing-client/use-pricing-client'
import { SettingsBillingDetails } from '../settings-billing-details/settings-billing-details'
import { SettingsBillingSummary } from '../settings-billing-summary/settings-billing-summary'
import { useBillingNavigate, useIsBillingUsageEnabled } from '../settings-billing-usage/settings-billing-usage'

function BillingPageLayout({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="w-full">
      <Section className="px-8 pb-8 pt-6">
        <SettingsHeading title={title} description={description} showNeedHelp={false} />
        <div className="flex max-w-content-with-navigation-left flex-col gap-6">{children}</div>
      </Section>
    </div>
  )
}

export function InvoicesView() {
  useDocumentTitle('Invoices - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })
  const client = usePricingClient()
  const goTo = useBillingNavigate(organizationId)

  return (
    <BillingPageLayout title="Invoices" description="Every invoice of this organization, to download or pay.">
      <BillingAlerts organizationId={organizationId} client={client} onNavigate={goTo} hide={['overdue']} />
      <InvoicesPage organizationId={organizationId} client={client} onManagePaymentMethod={() => goTo('billing')} />
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
      <BillingAlerts organizationId={organizationId} client={client} onNavigate={goTo} />
      <BillingSettingsPage organizationId={organizationId} client={client} />
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
