import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseAuthProvidersProps {
  organizationId: string
  enabled?: boolean
}

export function useAuthProviders({ organizationId, enabled }: UseAuthProvidersProps) {
  return useQuery({
    ...queries.organizations.authProviders({ organizationId }),
    enabled,
    refetchOnWindowFocus: false,
  })
}

export default useAuthProviders
