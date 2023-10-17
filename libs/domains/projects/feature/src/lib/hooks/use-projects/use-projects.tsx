import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseProjectsProps {
  organizationId?: string
}

export function useProjects({ organizationId }: UseProjectsProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.projects.list(organizationId!!),
    enabled: Boolean(organizationId),
  })
}

export default useProjects
