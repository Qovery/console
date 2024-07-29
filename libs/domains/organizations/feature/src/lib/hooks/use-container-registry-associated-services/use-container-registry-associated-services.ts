import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseContainerRegistryAssociatedServicesProps {
  organizationId: string
  containerRegistryId: string
}

export function useContainerRegistryAssociatedServices({
  organizationId,
  containerRegistryId,
}: UseContainerRegistryAssociatedServicesProps) {
  return useQuery({
    ...queries.organizations.containerRegistryAssociatedServices({ organizationId, containerRegistryId }),
  })
}

export default useContainerRegistryAssociatedServices
