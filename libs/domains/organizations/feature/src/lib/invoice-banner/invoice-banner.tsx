import { useNavigate, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { useCanManageBilling } from '@qovery/shared/iam/feature'
import { Banner, Button } from '@qovery/shared/ui'
import { useInvoices } from '../hooks/use-invoices/use-invoices'
import { isInvoicePayable, useRetryInvoicePayment } from '../retry-invoice-payment/use-retry-invoice-payment'

export function InvoiceBanner() {
  const { organizationId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const isRetryPaymentEnabled = Boolean(useFeatureFlagEnabled('billing-retry-payment'))
  const hideInvoiceBanner = Boolean(useFeatureFlagEnabled('hide_invoice_banner'))
  const { canManageBilling } = useCanManageBilling(organizationId)
  const isEnabled = Boolean(organizationId) && isRetryPaymentEnabled && canManageBilling && !hideInvoiceBanner
  // Members without billing access would get a 403 here, so the query only runs for billing roles
  const { data: invoices = [] } = useInvoices({ organizationId, enabled: isEnabled })
  const { requestPayment, pendingInvoiceId } = useRetryInvoicePayment({ organizationId })
  const unpaidInvoices = invoices.filter(isInvoicePayable)

  if (!isEnabled || unpaidInvoices.length === 0) {
    return null
  }

  const goToBillingDetails = () =>
    navigate({ to: '/organization/$organizationId/settings/billing-details', params: { organizationId } })

  // With several unpaid invoices, the user picks which one to pay from the invoices list
  const retryPayment = () =>
    unpaidInvoices.length === 1
      ? requestPayment(unpaidInvoices[0])
      : navigate({ to: '/organization/$organizationId/settings/billing-summary', params: { organizationId } })

  return (
    <Banner
      color="yellow"
      buttonLabel="Update payment method"
      buttonIconRight="arrow-right"
      onClickButton={goToBillingDetails}
    >
      {unpaidInvoices.length === 1
        ? 'You have an overdue invoice.'
        : `You have ${unpaidInvoices.length} overdue invoices.`}{' '}
      Update your payment method or retry the payment to avoid service interruption.
      <Button
        type="button"
        className="ml-4"
        variant="outline"
        color="yellow"
        loading={pendingInvoiceId !== undefined}
        onClick={retryPayment}
      >
        Retry payment
      </Button>
    </Banner>
  )
}

export default InvoiceBanner
