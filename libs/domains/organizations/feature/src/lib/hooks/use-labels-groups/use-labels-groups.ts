import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseLabelsGroupsProps {
  organizationId: string
}

export function useLabelsGroups({ organizationId }: UseLabelsGroupsProps) {
  return useQuery({
    ...queries.organizations.labelsGroups({ organizationId }),
  })
}

export default useLabelsGroups
