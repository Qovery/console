import { type Invoice } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Button, useModal } from '@qovery/shared/ui'
import { dateMediumLocalFormat } from '@qovery/shared/util-dates'
import { costToHuman } from '@qovery/shared/util-js'

export interface RetryInvoicePaymentModalProps {
  invoice: Invoice
  onConfirm: () => Promise<void>
}

export function RetryInvoicePaymentModal({ invoice, onConfirm }: RetryInvoicePaymentModalProps) {
  const { closeModal } = useModal()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const amount = costToHuman(invoice.total_in_cents / 100, invoice.currency_code)

  const confirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
    } finally {
      setIsSubmitting(false)
      closeModal()
    }
  }

  return (
    <div className="p-6">
      <h2 className="h4 mb-2 max-w-sm text-neutral">Pay this invoice now?</h2>
      <p className="mb-6 text-sm text-neutral-subtle">
        We will charge <strong className="font-medium text-neutral">{amount}</strong> to the card on file for the
        invoice of {dateMediumLocalFormat(invoice.created_at)}.
      </p>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="plain" color="neutral" size="lg" onClick={closeModal} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="button" size="lg" onClick={confirm} loading={isSubmitting}>
          Pay {amount}
        </Button>
      </div>
    </div>
  )
}

export default RetryInvoicePaymentModal
