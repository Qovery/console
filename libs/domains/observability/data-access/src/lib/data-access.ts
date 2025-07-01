import { createQueryKeys } from '@lukemorales/query-key-factory'
import { ClustersApi } from 'qovery-typescript-axios'

const clusterApi = new ClustersApi()

export const observability = createQueryKeys('observability', {
  observability: ({
    clusterId,
    query,
    startTimestamp,
    endTimestamp,
    step = '14',
  }: {
    clusterId: string
    query: string
    startTimestamp: string
    endTimestamp: string
    step?: string
  }) => ({
    queryKey: [query, startTimestamp, endTimestamp],
    async queryFn() {
      const response = await clusterApi.getClusterMetrics(
        clusterId,
        'api/v1/query_range',
        query,
        startTimestamp,
        endTimestamp,
        step
      )
      return response.data.metrics && JSON.parse(response.data.metrics)
    },
  }),
})
