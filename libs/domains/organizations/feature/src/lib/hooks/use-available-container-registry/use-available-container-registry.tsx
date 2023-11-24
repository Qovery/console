import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useAvailableContainerRegistry() {
  return useQuery({
    ...queries.organizations.availableContainerRegistry,
    select(registries) {
      return registries?.filter(({ kind }) => kind !== 'GCP_ARTIFACT_REGISTRY')
    },
  })
}

export default useAvailableContainerRegistry
