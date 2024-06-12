import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseLabelsGroupAssociatedItemsProps {
  organizationId: string
  labelsGroupId: string
  enabled?: boolean
}

export function useLabelsGroupAssociatedItems({
  organizationId,
  labelsGroupId,
  enabled = true,
}: UseLabelsGroupAssociatedItemsProps) {
  return useQuery({
    ...queries.organizations.labelsGroupAssociatedItems({ organizationId, labelsGroupId }),
    enabled,
  })
}

export default useLabelsGroupAssociatedItems
