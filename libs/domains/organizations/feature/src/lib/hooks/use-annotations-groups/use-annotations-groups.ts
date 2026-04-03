import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseAnnotationsGroupsProps {
  organizationId: string
  suspense?: boolean
}

export function useAnnotationsGroups({ organizationId, suspense = false }: UseAnnotationsGroupsProps) {
  return useQuery({
    ...queries.organizations.annotationsGroups({ organizationId }),
    suspense,
  })
}

export default useAnnotationsGroups
