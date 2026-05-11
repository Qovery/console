import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseOrganizationProps {
  organizationId: string
  enabled?: boolean
  suspense?: boolean
}

export function useOrganization({ organizationId, enabled, suspense = false }: UseOrganizationProps) {
  return useQuery({
    ...queries.organizations.details({ organizationId }),
    enabled,
    suspense,
  })
}

export default useOrganization
