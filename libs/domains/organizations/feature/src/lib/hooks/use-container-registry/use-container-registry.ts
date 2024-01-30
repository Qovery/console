import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseContainerRegistryProps {
  organizationId: string
  containerRegistryId?: string
}

export function useContainerRegistry({ organizationId, containerRegistryId }: UseContainerRegistryProps) {
  return useQuery({
    ...queries.organizations.containerRegistry({ organizationId, containerRegistryId: containerRegistryId! }),
    enabled: !!containerRegistryId,
  })
}

export default useContainerRegistry
