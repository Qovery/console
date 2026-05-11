import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseRunningStatusProps {
  environmentId?: string
  serviceId?: string
  suspense?: boolean
}

export function useRunningStatus({ environmentId, serviceId, suspense }: UseRunningStatusProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.services.runningStatus(environmentId!!, serviceId!!),
    enabled: Boolean(environmentId) && Boolean(serviceId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    suspense,
  })
}

export default useRunningStatus
