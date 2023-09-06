import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseMetricsProps {
  environmentId?: string
  serviceId?: string
}

export function useMetrics({ environmentId, serviceId }: UseMetricsProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.services.metrics(environmentId!!, serviceId!!),
    select(data) {
      if (!data) {
        return data
      }
      return data.sort((a, b) => a.pod_name.localeCompare(b.pod_name))
    },
    enabled: Boolean(environmentId) && Boolean(serviceId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })
}

export default useMetrics
