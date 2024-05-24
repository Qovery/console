import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseProjectsProps {
  organizationId: string
  enabled?: boolean
}

export function useProjects({ organizationId, enabled = true }: UseProjectsProps) {
  return useQuery({
    ...queries.projects.list({ organizationId }),
    select(data) {
      if (!data) {
        return data
      }
      return data.sort((a, b) => a.name.localeCompare(b.name))
    },
    enabled,
  })
}

export default useProjects
