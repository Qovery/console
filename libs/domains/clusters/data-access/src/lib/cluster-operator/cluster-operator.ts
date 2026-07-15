import { createQueryKeys } from '@lukemorales/query-key-factory'
import { ClusterOperatorApi } from 'qovery-typescript-axios'
import { isHttpStatus } from '../http/is-http-status'

const clusterOperatorApi = new ClusterOperatorApi()

export const clusterOperator = createQueryKeys('clusterOperator', {
  status: ({ organizationId, clusterId }: { organizationId: string; clusterId: string }) => ({
    queryKey: [organizationId, clusterId],
    async queryFn() {
      try {
        const response = await clusterOperatorApi.getClusterOperatorStatus(organizationId, clusterId)
        return response.data
      } catch (error) {
        if (isHttpStatus(error, 404)) return null
        throw error
      }
    },
  }),
  bootstrap: ({ organizationId, clusterId }: { organizationId: string; clusterId: string }) => ({
    queryKey: [organizationId, clusterId],
    async queryFn() {
      const response = await clusterOperatorApi.getClusterOperatorBootstrap(organizationId, clusterId)
      return response.data
    },
  }),
})

export const clusterOperatorMutations = {
  async attach({ organizationId, clusterId }: { organizationId: string; clusterId: string }) {
    await clusterOperatorApi.attachClusterOperator(organizationId, clusterId)
  },
}
