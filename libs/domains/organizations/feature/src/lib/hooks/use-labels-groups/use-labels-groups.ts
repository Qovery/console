import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseLabelsGroupsProps {
  organizationId: string
  suspense?: boolean
}

export function useLabelsGroups({ organizationId, suspense = false }: UseLabelsGroupsProps) {
  return useQuery({
    ...queries.organizations.labelsGroups({ organizationId }),
    suspense,
  })
}

export default useLabelsGroups
