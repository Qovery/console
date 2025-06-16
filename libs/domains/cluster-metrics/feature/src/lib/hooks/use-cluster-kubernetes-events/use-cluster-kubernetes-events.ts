import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterKubernetesEventsProps {
  clusterId: string
  nodeName: string
  fromDateTime: string
  toDateTime: string
  enabled?: boolean
}

export function useClusterKubernetesEvents({
  clusterId,
  nodeName,
  fromDateTime,
  toDateTime,
  enabled = true,
}: UseClusterKubernetesEventsProps) {
  return useQuery({
    ...queries.clusterMetrics.events({ clusterId, nodeName, fromDateTime, toDateTime }),
    meta: {
      notifyOnError: true,
    },
    enabled,
  })
}

export default useClusterKubernetesEvents
