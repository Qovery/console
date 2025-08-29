import { createQueryKeys } from '@lukemorales/query-key-factory'
import { ClustersApi } from 'qovery-typescript-axios'

const clusterApi = new ClustersApi()

export const observability = createQueryKeys('observability', {
  deploymentId: ({ clusterId, serviceId }: { clusterId: string; serviceId: string }) => ({
    queryKey: ['deploymentId', clusterId, serviceId],
    async queryFn() {
      const endpoint = `api/v1/label/deployment/values?match[]=kube_deployment_labels{label_qovery_com_service_id="${serviceId}"}&match[]=kube_statefulset_labels{label_qovery_com_service_id="${serviceId}"}`
      const response = await clusterApi.getClusterMetrics(clusterId, endpoint, '')
      return response.data.metrics && (JSON.parse(response.data.metrics).data[0] as string)
    },
  }),
  observability: ({
    clusterId,
    query,
    queryRange = 'query_range',
    startTimestamp,
    endTimestamp,
    step,
    timeRange,
    maxSourceResolution,
  }: {
    clusterId: string
    query: string
    step: string
    maxSourceResolution: string
    startTimestamp?: string
    endTimestamp?: string
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
        undefined,
        undefined,
        'True',
        'True',
        maxSourceResolution,
        'thanos',
        'false'
      )

      return response.data.metrics && JSON.parse(response.data.metrics)
    },
  }),
})
