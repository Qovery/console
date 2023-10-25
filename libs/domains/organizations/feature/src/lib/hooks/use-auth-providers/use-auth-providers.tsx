import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseAuthProvidersProps {
  organizationId: string
}

export function useAuthProviders({ organizationId }: UseAuthProvidersProps) {
  return useQuery({
    ...queries.organizations.authProviders(organizationId),
  })
}

export default useAuthProviders
