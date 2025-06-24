import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseCheckRunningStatusClosedProps {
  clusterId: string
  environmentId: string
}

export function useCheckRunningStatusClosed({ clusterId, environmentId }: UseCheckRunningStatusClosedProps) {
  return useQuery({
    ...queries.services.checkRunningStatusClosed(clusterId, environmentId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })
}

export default useCheckRunningStatusClosed
