import { type Invoice, InvoiceStatusEnum } from 'qovery-typescript-axios'
import { Button, Tooltip } from '@qovery/shared/ui'

export interface RetryInvoicePaymentButtonProps {
  invoice: Invoice
  onClick: (invoice: Invoice) => void
  isLoading?: boolean
  retryAllowedAt?: number
}

export function RetryInvoicePaymentButton({
  invoice,
  onClick,
  isLoading = false,
  retryAllowedAt,
}: RetryInvoicePaymentButtonProps) {
  const label = invoice.status === InvoiceStatusEnum.PAYMENT_DUE ? 'Pay now' : 'Retry payment'

  const button = (
    <Button
      data-testid="retry-invoice-payment-btn"
      type="button"
      variant="outline"
      color="neutral"
      size="md"
      loading={isLoading}
      disabled={isLoading || retryAllowedAt !== undefined}
      onClick={() => onClick(invoice)}
    >
      {label}
    </Button>
  )

  if (retryAllowedAt === undefined) return button

  return (
    <Tooltip
      content={`A payment was just attempted. You can try again after ${new Date(retryAllowedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`}
    >
      <span>{button}</span>
    </Tooltip>
  )
}

export default RetryInvoicePaymentButton
