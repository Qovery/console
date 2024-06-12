import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseAnnotationsGroupAssociatedItemsProps {
  organizationId: string
  annotationsGroupId: string
  enabled?: boolean
}

export function useAnnotationsGroupAssociatedItems({
  organizationId,
  annotationsGroupId,
  enabled = true,
}: UseAnnotationsGroupAssociatedItemsProps) {
  return useQuery({
    ...queries.organizations.annotationsGroupAssociatedItems({ organizationId, annotationsGroupId }),
    enabled,
  })
}

export default useAnnotationsGroupAssociatedItems
