import { useQuery } from '@tanstack/react-query'
import { type Project } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export interface UseProjectsProps {
  organizationId: string
  enabled?: boolean
}

export const projectsQuery = ({ organizationId }: { organizationId: string }) => ({
  ...queries.projects.list({ organizationId }),
  select(data?: Project[]) {
    if (!data) {
      return data
    }
    return data.sort((a, b) => a.name.localeCompare(b.name))
  },
})

export function useProjects({ organizationId, enabled = true }: UseProjectsProps) {
  return useQuery({
    ...projectsQuery({ organizationId }),

    enabled,
  })
}

export default useProjects
