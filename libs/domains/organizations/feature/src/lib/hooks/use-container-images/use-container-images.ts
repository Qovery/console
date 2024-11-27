import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseContainerImagesProps {
  organizationId: string
  containerRegistryId: string
  search: string
  enabled?: boolean
}

export function useContainerImages({ organizationId, containerRegistryId, search, enabled }: UseContainerImagesProps) {
  return useQuery({
    ...queries.organizations.containerImages({ organizationId, containerRegistryId, search }),
    enabled,
    keepPreviousData: true,
  })
}

export default useContainerImages
