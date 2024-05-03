import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseAnnotationsGroupAssociatedItemsProps {
  organizationId: string
  annotationsGroupId: string
}

export function useAnnotationsGroupAssociatedItems({
  organizationId,
  annotationsGroupId,
}: UseAnnotationsGroupAssociatedItemsProps) {
  return useQuery({
    ...queries.organizations.annotationsGroupAssociatedItems({ organizationId, annotationsGroupId }),
  })
}

export default useAnnotationsGroupAssociatedItems
