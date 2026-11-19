import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Invoice } from 'qovery-typescript-axios'
import { mutations, parseCollectInvoiceError } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCollectInvoice() {
  const queryClient = useQueryClient()

  const refreshInvoices = (organizationId: string) => {
    queryClient.invalidateQueries({ queryKey: queries.organizations.invoices({ organizationId }).queryKey })
    queryClient.invalidateQueries({ queryKey: queries.organizations.currentCost({ organizationId }).queryKey })
  }

  return useMutation(mutations.collectInvoice, {
    onSuccess(invoice, { organizationId, invoiceId }) {
      // Show the new status right away, then refetch to stay in sync with the API
      queryClient.setQueryData<Invoice[]>(queries.organizations.invoices({ organizationId }).queryKey, (invoices) =>
        invoices?.map((current) => (current.id === invoiceId ? { ...current, ...invoice } : current))
      )
      refreshInvoices(organizationId)
    },
    onError(error, { organizationId }) {
      const { type } = parseCollectInvoiceError(error)
      // The invoice changed or disappeared since the list was loaded
      if (type === 'INVOICE_NOT_COLLECTABLE' || type === 'NOT_FOUND' || type === 'PAYMENT_FAILED') {
        refreshInvoices(organizationId)
      }
    },
  })
}

export default useCollectInvoice
