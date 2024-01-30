import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseOrganizationProps {
  organizationId: string
  enabled?: boolean
}

export function useOrganization({ organizationId, enabled }: UseOrganizationProps) {
  return useQuery({
    ...queries.organizations.details({ organizationId }),
    enabled,
  })
}

export default useOrganization
