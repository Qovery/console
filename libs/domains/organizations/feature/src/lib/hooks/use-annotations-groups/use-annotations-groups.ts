import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseAnnotationsGroupsProps {
  organizationId: string
}

export function useAnnotationsGroups({ organizationId }: UseAnnotationsGroupsProps) {
  return useQuery({
    ...queries.organizations.annotationsGroups({ organizationId }),
  })
}

export default useAnnotationsGroups
