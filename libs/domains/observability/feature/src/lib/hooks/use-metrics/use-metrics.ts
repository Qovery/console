import { useQuery } from '@tanstack/react-query'
import { ClustersApi } from 'qovery-typescript-axios'

interface UseMetricsWSProps {
  type: 'cpu' | 'memory'
  organizationId: string
  clusterId: string
  startDate: string
  endDate: string
  serviceId?: string
  customQuery?: string
  customApiEndpoint?: string
}

const clusterApi = new ClustersApi()

export function useMetrics({
  type,
  organizationId,
  clusterId,
  startDate,
  endDate,
  serviceId,
  customQuery,
  customApiEndpoint,
}: UseMetricsWSProps) {
  return useQuery({
    queryKey: [
      'metrics',
      type,
      organizationId,
      clusterId,
      serviceId,
      customQuery,
      customApiEndpoint,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const serviceFilter = `label_qovery_com_service_id="${serviceId}"`
      const query =
        type === 'cpu'
          ? `rate(container_cpu_usage_seconds_total{container!=""}[5m])* on(namespace, pod) group_left(label_value) kube_pod_labels{${serviceFilter}}`
          : `container_memory_usage_bytes{container!=""} * on(namespace, pod) group_left(label_value) kube_pod_labels{${serviceFilter}}`

      let step = '14'

      try {
        const start =
          typeof startDate === 'string' && !isNaN(Number(startDate))
            ? Number(startDate) * 1000
            : new Date(startDate).getTime()
        const end =
          typeof endDate === 'string' && !isNaN(Number(endDate)) ? Number(endDate) * 1000 : new Date(endDate).getTime()

        if (!isNaN(start) && !isNaN(end) && end > start) {
          const durationInSeconds = (end - start) / 1000
          // 6h (21600s) = 86 step, 2h (7200s) = 28 step
          // This gives us approximately 250 seconds per step
          const calculatedStep = Math.max(Math.round(durationInSeconds / 250), 1)
          step = calculatedStep.toString()
        }
      } catch (error) {
        console.warn('Failed to calculate step, using fallback:', error)
      }

      const response = await clusterApi.getClusterMetrics(
        clusterId,
        customApiEndpoint || 'api/v1/query_range',
        customQuery || query,
        startDate,
        endDate,
        step
      )
      return response.data.metrics && JSON.parse(response.data.metrics)
    },
  })
}

export default useMetrics
