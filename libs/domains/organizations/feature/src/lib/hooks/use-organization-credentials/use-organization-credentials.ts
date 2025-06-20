import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseOrganizationCredentialsProps {
  organizationId: string
}

export function useOrganizationCredentials({ organizationId }: UseOrganizationCredentialsProps) {
  return useQuery({
    ...queries.organizations.listCredentials({ organizationId }),
    suspense: true,
  })
}

export default useOrganizationCredentials
