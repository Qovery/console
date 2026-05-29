import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseEnvironmentsOverviewProps {
  projectId: string
  filterEnvironmentId?: string
  enabled?: boolean
  suspense?: boolean
}

export function useEnvironmentsOverview({
  projectId,
  filterEnvironmentId,
  enabled,
  suspense = false,
}: UseEnvironmentsOverviewProps) {
  return useQuery({
    ...queries.projects.environmentsOverview({ projectId }),
    select: (overview) => {
      if (filterEnvironmentId) {
        return (overview ?? []).filter((o) => o.id === filterEnvironmentId)
      }
      return overview
    },
    enabled,
    suspense,
  })
}

export default useEnvironmentsOverview
