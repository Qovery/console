import { createQueryKeys } from '@lukemorales/query-key-factory'
import { ClustersApi } from 'qovery-typescript-axios'

const clusterApi = new ClustersApi()

export const observability = createQueryKeys('observability', {
  observability: ({
    clusterId,
    query,
    queryRange = 'query_range',
    startTimestamp,
    endTimestamp,
    step,
    timeRange,
  }: {
    clusterId: string
    query: string
    step: string
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
        'auto', // TODO PG not set auto but 0, 5m or 1h
        'thanos',
        'false'
      )
      return response.data.metrics && JSON.parse(response.data.metrics)
    },
  }),
})
