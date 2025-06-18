import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterKubernetesEventsProps {
  clusterId: string
  fromDateTime: string
  toDateTime: string
  reportingComponent?: string
  nodeName?: string
  enabled?: boolean
}

export function useClusterKubernetesEvents({
  clusterId,
  nodeName,
  fromDateTime,
  toDateTime,
  reportingComponent,
  enabled = true,
}: UseClusterKubernetesEventsProps) {
  return useQuery({
    ...queries.clusterMetrics.events({ clusterId, nodeName, fromDateTime, toDateTime, reportingComponent }),
    meta: {
      notifyOnError: true,
    },
    enabled,
  })
}

export default useClusterKubernetesEvents
