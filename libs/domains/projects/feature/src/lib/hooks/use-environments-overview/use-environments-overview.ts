import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseEnvironmentsOverviewProps {
  projectId: string
  environmentId?: string
  enabled?: boolean
  suspense?: boolean
}

export function useEnvironmentsOverview({
  projectId,
  environmentId,
  enabled,
  suspense = false,
}: UseEnvironmentsOverviewProps) {
  return useQuery({
    ...queries.projects.environmentsOverview({ projectId }),
    select: (overview) => {
      if (environmentId) {
        return (overview ?? []).filter((o) => o.id === environmentId)
      }
      return overview
    },
    enabled,
    suspense,
  })
}

export default useEnvironmentsOverview
