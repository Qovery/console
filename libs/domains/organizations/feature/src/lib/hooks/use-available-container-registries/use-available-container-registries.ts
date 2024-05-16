import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useAvailableContainerRegistries() {
  return useQuery({
    ...queries.organizations.availableContainerRegistries,
    select(registries) {
      return registries
    },
  })
}

export default useAvailableContainerRegistries
