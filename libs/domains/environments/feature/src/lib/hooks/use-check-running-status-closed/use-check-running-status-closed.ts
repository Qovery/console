import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseCheckRunningStatusClosedProps {
  clusterId: string
}

export function useCheckRunningStatusClosed({ clusterId }: UseCheckRunningStatusClosedProps) {
  return useQuery({
    ...queries.environments.checkRunningStatusClosed(clusterId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })
}

export default useCheckRunningStatusClosed
