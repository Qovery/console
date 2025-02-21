import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseProjectProps {
  organizationId?: string
  projectId?: string
}

export function useProject({ organizationId, projectId }: UseProjectProps) {
  return useQuery({
    ...queries.projects.list({ organizationId: organizationId!! }),
    select: (data) => data?.find((project) => project.id === projectId),
    enabled: Boolean(organizationId) || Boolean(projectId),
  })
}

export default useProject
