import { createQueryKeys } from '@lukemorales/query-key-factory'
import { ClustersApi } from 'qovery-typescript-axios'

const clusterApi = new ClustersApi()

export const serviceLogs = createQueryKeys('serviceLogs', {
  serviceLogs: ({
    clusterId,
    serviceId,
    query,
    queryRange = 'query_range',
    startTimestamp,
    endTimestamp,
    timeRange,
  }: {
    clusterId: string
    serviceId: string
    query: string
    startTimestamp?: string
    endTimestamp?: string
    queryRange?: 'query' | 'query_range'
    timeRange?: string
  }) => ({
    queryKey: [query, timeRange, startTimestamp, endTimestamp, serviceId],
    async queryFn() {
      const response = await clusterApi.getClusterMetrics(
        clusterId,
        `api/v1/${queryRange}`,
        query,
        startTimestamp,
        endTimestamp
      )

      return response.data.metrics && JSON.parse(response.data.metrics)
    },
  }),
})
