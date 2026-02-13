import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseEnvironmentsOverviewProps {
  projectId: string
  enabled?: boolean
  suspense?: boolean
}

export function useEnvironmentsOverview({ projectId, enabled, suspense = false }: UseEnvironmentsOverviewProps) {
  return useQuery({
    ...queries.projects.environmentsOverview({ projectId }),
    enabled,
    suspense,
  })
}

export default useEnvironmentsOverview
