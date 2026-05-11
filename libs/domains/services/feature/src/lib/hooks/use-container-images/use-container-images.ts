import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseContainerImagesProps {
  organizationId: string
  containerRegistryId: string
  search: string
  enabled?: boolean
  retry?: boolean
}

export function useContainerImages({
  organizationId,
  containerRegistryId,
  search,
  enabled,
  retry = true,
}: UseContainerImagesProps) {
  return useQuery({
    ...queries.organizations.containerImages({ organizationId, containerRegistryId, search }),
    enabled,
    keepPreviousData: true,
    retry,
  })
}

export default useContainerImages
