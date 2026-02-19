import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseAuthProvidersProps {
  organizationId: string
  enabled?: boolean
  suspense?: boolean
}

export function useAuthProviders({ organizationId, enabled, suspense }: UseAuthProvidersProps) {
  return useQuery({
    ...queries.organizations.authProviders({ organizationId }),
    enabled,
    suspense,
    refetchOnWindowFocus: false,
  })
}

export default useAuthProviders
