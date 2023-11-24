import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseAvailableContainerRegistryProps {
  organizationId: string
}

export function useAvailableContainerRegistry({ organizationId }: UseAvailableContainerRegistryProps) {
  return useQuery({
    ...queries.organizations.availableContainerRegistry({ organizationId }),
    select(registries) {
      return registries?.filter(({ kind }) => kind !== 'GCP_ARTIFACT_REGISTRY')
    },
  })
}

export default useAvailableContainerRegistry
