import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

interface UseMetricsWSProps {
  clusterId: string
  query: string
  startTimestamp: string
  endTimestamp: string
}

export function useMetrics({ clusterId, query, startTimestamp, endTimestamp }: UseMetricsWSProps) {
  let step: string | undefined
  const start =
    typeof startTimestamp === 'string' && !isNaN(Number(startTimestamp))
      ? Number(startTimestamp) * 1000
      : new Date(startTimestamp).getTime()
  const end =
    typeof endTimestamp === 'string' && !isNaN(Number(endTimestamp))
      ? Number(endTimestamp) * 1000
      : new Date(endTimestamp).getTime()

  if (!isNaN(start) && !isNaN(end) && end > start) {
    const durationInSeconds = (end - start) / 1000
    // 6h (21600s) = 86 step, 2h (7200s) = 28 step
    // This gives us approximately 250 seconds per step
    const calculatedStep = Math.max(Math.round(durationInSeconds / 250), 1)
    step = calculatedStep.toString()
  }

  return useQuery({
    ...observability.observability({ clusterId, query, startTimestamp, endTimestamp, step }),
  })
}

export interface MetricData {
  metric: {
    container: string
    cpu: string
    endpoint: string
    id: string
    image: string
    instance: string
    job: string
    metrics_path: string
    name: string
    namespace: string
    node: string
    pod: string
    prometheus: string
    service: string
  }
  values: [number, string][]
}

// interface UseMetricsWSProps {
//   type: 'cpu' | 'memory'
//   organizationId: string
//   clusterId: string
//   startDate: string
//   endDate: string
//   serviceId?: string
//   customQuery?: string
//   customApiEndpoint?: string
// }

// const clusterApi = new ClustersApi()

// export function useMetrics({
//   type,
//   organizationId,
//   clusterId,
//   startDate,
//   endDate,
//   serviceId,
//   customQuery,
//   customApiEndpoint,
// }: UseMetricsWSProps) {
//   return useQuery({
//     queryKey: [
//       'metrics',
//       type,
//       organizationId,
//       clusterId,
//       serviceId,
//       customQuery,
//       customApiEndpoint,
//       startDate,
//       endDate,
//     ],
//     queryFn: async () => {
//       const serviceFilter = `label_qovery_com_service_id="${serviceId}"`
//       const query =
//         type === 'cpu'
//           ? `rate(container_cpu_usage_seconds_total{container!=""}[5m])* on(namespace, pod) group_left(label_value) kube_pod_labels{${serviceFilter}}`
//           : `container_memory_usage_bytes{container!=""} * on(namespace, pod) group_left(label_value) kube_pod_labels{${serviceFilter}}`

// let step = '14'

// try {
//   const start =
//     typeof startDate === 'string' && !isNaN(Number(startDate))
//       ? Number(startDate) * 1000
//       : new Date(startDate).getTime()
//   const end =
//     typeof endDate === 'string' && !isNaN(Number(endDate)) ? Number(endDate) * 1000 : new Date(endDate).getTime()

//   if (!isNaN(start) && !isNaN(end) && end > start) {
//     const durationInSeconds = (end - start) / 1000
//     // 6h (21600s) = 86 step, 2h (7200s) = 28 step
//     // This gives us approximately 250 seconds per step
//     const calculatedStep = Math.max(Math.round(durationInSeconds / 250), 1)
//     step = calculatedStep.toString()
//   }
// } catch (error) {
//   console.warn('Failed to calculate step, using fallback:', error)
// }

//       const response = await clusterApi.getClusterMetrics(
//         clusterId,
//         customApiEndpoint || 'api/v1/query_range',
//         customQuery || query,
//         startDate,
//         endDate,
//         step
//       )
//       return response.data.metrics && JSON.parse(response.data.metrics)
//     },
//   })
// }

// export default useMetrics
