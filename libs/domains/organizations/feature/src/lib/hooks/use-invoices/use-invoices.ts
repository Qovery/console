import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseInvoicesProps {
  organizationId: string
}

export function useInvoices({ organizationId }: UseInvoicesProps) {
  return useQuery({
    ...queries.organizations.invoices({ organizationId }),
  })
}

export default useInvoices
