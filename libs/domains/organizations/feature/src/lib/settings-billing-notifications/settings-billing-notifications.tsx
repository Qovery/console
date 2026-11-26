import { redirect, useParams } from '@tanstack/react-router'
import { EmailPreferencesPanel, usePricingClient } from '@qovery/shared/billing/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { BillingPageLayout } from '../settings-billing-usage/settings-billing-usage'

// The Billing entry follows the new billing pages (billing-usage-v2), like Usage, Invoices and Billing
export function getNotificationsSettingsLinks(pathSettings: string, isBillingUsageEnabled: boolean) {
  return [
    { title: 'Slack', to: `${pathSettings}/notifications/slack` },
    { title: 'Webhook', to: `${pathSettings}/webhook` },
    ...(isBillingUsageEnabled ? [{ title: 'Billing', to: `${pathSettings}/notifications/billing` }] : []),
  ]
}

// Billing emails sent before this page link to /settings/billing?section=emails: the Usage route's beforeLoad sends them here
export function redirectLegacyBillingEmailsLink({
  params,
  search,
}: {
  params: { organizationId: string }
  search: unknown
}) {
  if ((search as { section?: unknown } | undefined)?.section === 'emails') {
    throw redirect({
      to: '/organization/$organizationId/settings/notifications/billing',
      params: { organizationId: params.organizationId },
      replace: true,
    })
  }
}

// Every member sets their own billing emails (pricing-api keeps one choice per person and organization).
// The page is not behind the flag: the "Email preferences" link of every billing email opens it.
export function SettingsBillingNotifications() {
  useDocumentTitle('Billing notifications - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })
  const client = usePricingClient()

  return (
    <BillingPageLayout
      title="Billing notifications"
      description="Choose which emails you get about this organization's plan, usage and billing. Each member sets their own, and billing roles always get billing emails."
    >
      <EmailPreferencesPanel organizationId={organizationId} client={client} />
    </BillingPageLayout>
  )
}

export default SettingsBillingNotifications
