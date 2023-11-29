import { createQueryKeys } from '@lukemorales/query-key-factory'
import { type ClusterDeleteMode, ClustersApi } from 'qovery-typescript-axios'

const clusterApi = new ClustersApi()

export const clusters = createQueryKeys('clusters', {
  list: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await clusterApi.listOrganizationCluster(organizationId)
      return response.data.results
    },
  }),
  listStatuses: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await clusterApi.getOrganizationClusterStatus(organizationId)
      return response.data.results
    },
  }),
  status: ({ organizationId, clusterId }: { organizationId: string; clusterId: string }) => ({
    queryKey: [organizationId, clusterId],
    async queryFn() {
      const response = await clusterApi.getClusterStatus(organizationId, clusterId)
      return response.data
    },
  }),
})

interface DeleteClusterProps {
  organizationId: string
  clusterId: string
  clusterDeleteMode: ClusterDeleteMode
}

export const mutations = {
  async deleteCluster({ organizationId, clusterId, clusterDeleteMode }: DeleteClusterProps) {
    const response = await clusterApi.deleteCluster(organizationId, clusterId, clusterDeleteMode)
    return response.data
  },
}
