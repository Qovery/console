import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UsecheckRunningStatusClosedProps {
  clusterId: string
  environmentId: string
}

export function usecheckRunningStatusClosed({ clusterId, environmentId }: UsecheckRunningStatusClosedProps) {
  return useQuery({
    ...queries.services.checkRunningStatusClosed(clusterId, environmentId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })
}

export default usecheckRunningStatusClosed
