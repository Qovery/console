import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseProjectsProps {
  organizationId: string
  enabled?: boolean
  suspense?: boolean
}

export function useProjects({ organizationId, enabled = true, suspense = false }: UseProjectsProps) {
  return useQuery({
    ...queries.projects.list({ organizationId }),
    select(data) {
      if (!data) {
        return data
      }
      return data.sort((a, b) => a.name.localeCompare(b.name))
    },
    enabled,
    suspense,
  })
}

export default useProjects
