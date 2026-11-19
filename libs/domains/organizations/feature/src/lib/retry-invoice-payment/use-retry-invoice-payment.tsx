import { useNavigate } from '@tanstack/react-router'
import { type Invoice, InvoiceStatusEnum } from 'qovery-typescript-axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { match } from 'ts-pattern'
import { parseCollectInvoiceError } from '@qovery/domains/organizations/data-access'
import { toast, useModal } from '@qovery/shared/ui'
import { dateMediumLocalFormat } from '@qovery/shared/util-dates'
import { useCollectInvoice } from '../hooks/use-collect-invoice/use-collect-invoice'
import { RetryInvoicePaymentModal } from './retry-invoice-payment-modal'

export const isInvoicePayable = (invoice: Pick<Invoice, 'status'>) =>
  invoice.status === InvoiceStatusEnum.PAYMENT_DUE || invoice.status === InvoiceStatusEnum.NOT_PAID

const minutesFromSeconds = (seconds: number) => {
  const minutes = Math.max(1, Math.ceil(seconds / 60))
  return `${minutes} minute${minutes === 1 ? '' : 's'}`
}

export function useRetryInvoicePayment({ organizationId }: { organizationId: string }) {
  const navigate = useNavigate()
  const { openModal } = useModal()
  const { mutateAsync, isLoading, variables } = useCollectInvoice()
  // Invoices the API asked us to wait for (429), with the time a new attempt is allowed
  const [retryAllowedAt, setRetryAllowedAt] = useState<Record<string, number>>({})
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), [])

  const blockRetry = useCallback((invoiceId: string, seconds: number) => {
    setRetryAllowedAt((current) => ({ ...current, [invoiceId]: Date.now() + seconds * 1000 }))
    timeoutsRef.current.push(
      setTimeout(() => {
        setRetryAllowedAt(({ [invoiceId]: _, ...rest }) => rest)
      }, seconds * 1000)
    )
  }, [])

  const goToBillingDetails = useCallback(
    () => navigate({ to: '/organization/$organizationId/settings/billing-details', params: { organizationId } }),
    [navigate, organizationId]
  )

  const pay = useCallback(
    async (invoice: Invoice) => {
      try {
        const updatedInvoice = await mutateAsync({ organizationId, invoiceId: invoice.id })
        if (updatedInvoice?.status === InvoiceStatusEnum.PAID) {
          toast('success', 'Payment succeeded', `The invoice of ${dateMediumLocalFormat(invoice.created_at)} is paid.`)
        } else {
          toast('success', 'Payment sent', 'The invoice status updates once your bank confirms the payment.')
        }
      } catch (error) {
        match(parseCollectInvoiceError(error))
          .with({ type: 'PAYMENT_FAILED' }, ({ reason }) =>
            toast(
              'error',
              'Payment failed',
              reason ?? 'Your card was not charged.',
              goToBillingDetails,
              'Update payment method'
            )
          )
          .with({ type: 'COLLECT_TOO_SOON' }, ({ retryAfterSeconds }) => {
            blockRetry(invoice.id, retryAfterSeconds)
            toast(
              'warning',
              'A payment was just attempted on this invoice',
              `You can try again in ${minutesFromSeconds(retryAfterSeconds)}.`
            )
          })
          .with({ type: 'INVOICE_NOT_COLLECTABLE' }, () =>
            toast('warning', 'This invoice cannot be paid now', 'Its status changed. The list is up to date again.')
          )
          .with({ type: 'NOT_FOUND' }, () => toast('error', 'Invoice not found'))
          .with({ type: 'FORBIDDEN' }, () =>
            toast('error', 'Only Owners, Admins and Billing Managers can pay invoices')
          )
          .with({ type: 'UNKNOWN' }, ({ reason }) =>
            toast('error', 'The payment could not be sent', reason ?? 'Try again later.')
          )
          .exhaustive()
      }
    },
    [mutateAsync, organizationId, goToBillingDetails, blockRetry]
  )

  const requestPayment = useCallback(
    (invoice: Invoice) => {
      openModal({ content: <RetryInvoicePaymentModal invoice={invoice} onConfirm={() => pay(invoice)} /> })
    },
    [openModal, pay]
  )

  return {
    requestPayment,
    pendingInvoiceId: isLoading ? variables?.invoiceId : undefined,
    getRetryAllowedAt: (invoiceId: string) => retryAllowedAt[invoiceId] as number | undefined,
  }
}

export default useRetryInvoicePayment
