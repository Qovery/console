import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UsecheckRunningStatusClosedProps {
  clusterId: string
}

export function usecheckRunningStatusClosed({ clusterId }: UsecheckRunningStatusClosedProps) {
  return useQuery({
    ...queries.environments.checkRunningStatusClosed(clusterId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })
}

export default usecheckRunningStatusClosed
