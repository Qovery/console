import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseRunningStatusProps {
  environmentId?: string
}

export function useRunningStatus({ environmentId }: UseRunningStatusProps) {
  const enabled = Boolean(environmentId)

  return useQuery({
    ...queries.environments.runningStatus({ environmentId: environmentId ?? '', scope: 'environment' }),
    enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })
}

export default useRunningStatus
