import { createQueryKeys } from '@lukemorales/query-key-factory'
import { ClustersApi } from 'qovery-typescript-axios'

const clusterApi = new ClustersApi()

export const observability = createQueryKeys('observability', {
  containerName: ({
    clusterId,
    serviceId,
    resourceType = 'deployment',
  }: {
    clusterId: string
    serviceId: string
    resourceType?: 'deployment' | 'statefulset'
  }) => ({
    queryKey: ['containerName', clusterId, serviceId, resourceType],
    async queryFn() {
      const endpoints = {
        deployment: `api/v1/label/deployment/values?match[]=kube_deployment_labels{label_qovery_com_service_id="${serviceId}"}`,
        statefulset: `api/v1/label/statefulset/values?match[]=kube_statefulset_labels{label_qovery_com_service_id="${serviceId}"}`,
      }

      const endpoint = endpoints[resourceType]
      const response = await clusterApi.getClusterMetrics(clusterId, endpoint, '')
      return response.data.metrics && (JSON.parse(response.data.metrics).data[0] as string)
    },
  }),
  ingressName: ({ clusterId, serviceId }: { clusterId: string; serviceId: string }) => ({
    queryKey: ['ingressName', clusterId, serviceId],
    async queryFn() {
      const endpoint = `api/v1/label/ingress/values?match[]=kube_ingress_labels{label_qovery_com_associated_service_id="${serviceId}"}`
      const response = await clusterApi.getClusterMetrics(clusterId, endpoint, '')
      return response.data.metrics && (JSON.parse(response.data.metrics).data[0] as string)
    },
  }),
  metrics: ({
    clusterId,
    query,
    queryRange,
    startTimestamp,
    endTimestamp,
    time,
    step,
    timeRange,
    maxSourceResolution,
    boardShortName,
    metricShortName,
    traceId,
    alignedRange,
  }: {
    clusterId: string
    query: string
    maxSourceResolution: string
    boardShortName: string
    metricShortName: string
    traceId: string
    alignedRange: string
    step?: string
    startTimestamp?: string
    endTimestamp?: string
    time?: string
    queryRange?: 'query' | 'query_range'
    timeRange?: string
  }) => ({
    queryKey: [query, timeRange, startTimestamp, endTimestamp, step],
    async queryFn() {
      const response = await clusterApi.getClusterMetrics(
        clusterId,
        `api/v1/${queryRange}`,
        query,
        startTimestamp,
        endTimestamp,
        step,
        time,
        undefined,
        'True',
        'True',
        maxSourceResolution,
        'thanos',
        'false',
        boardShortName,
        metricShortName,
        traceId,
        alignedRange
      )

      return response.data.metrics && JSON.parse(response.data.metrics)
    },
  }),
})
