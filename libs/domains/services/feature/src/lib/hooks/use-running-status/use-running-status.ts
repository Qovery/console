import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseRunningStatusProps {
  environmentId?: string
  serviceId?: string
  enabled?: boolean
  suspense?: boolean
}

export function useRunningStatus({ environmentId, serviceId, enabled = true, suspense }: UseRunningStatusProps) {
  return useQuery({
    ...queries.services.runningStatus(environmentId ?? '', serviceId ?? ''),
    enabled: enabled && Boolean(environmentId) && Boolean(serviceId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    suspense,
  })
}

export default useRunningStatus
