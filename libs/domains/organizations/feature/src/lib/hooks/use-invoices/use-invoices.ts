import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseInvoicesProps {
  organizationId: string
  enabled?: boolean
  suspense?: boolean
}

export function useInvoices({ organizationId, enabled = true, suspense = false }: UseInvoicesProps) {
  return useQuery({
    ...queries.organizations.invoices({ organizationId }),
    enabled,
    suspense,
  })
}

export default useInvoices
