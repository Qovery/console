import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'

export function useInvoiceUrl() {
  return useMutation(mutations.invoiceUrl, {
    meta: {
      notifyOnSuccess: {
        title: 'Invoice downloaded',
      },
      notifyOnError: true,
    },
  })
}

export default useInvoiceUrl
