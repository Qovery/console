import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseProjectProps {
  organizationId: string
  projectId: string
  suspense?: boolean
}

export function useProject({ organizationId, projectId, suspense = false }: UseProjectProps) {
  return useQuery({
    ...queries.projects.list({ organizationId }),
    select: (data) => data?.find((project) => project.id === projectId),
    suspense,
  })
}

export default useProject
