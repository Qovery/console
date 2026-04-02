import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseEksAnywhereCommitsProps {
  organizationId: string
  clusterId: string
  enabled?: boolean
}

export function useEksAnywhereCommits(props: UseEksAnywhereCommitsProps) {
  const { enabled = true, organizationId, clusterId } = props

  return useQuery({
    ...queries.clusters.eksAnywhereCommits({ organizationId, clusterId }),
    enabled: enabled && Boolean(organizationId && clusterId),
    staleTime: 0,
    retry: false,
    retryOnMount: true,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  })
}

export default useEksAnywhereCommits
