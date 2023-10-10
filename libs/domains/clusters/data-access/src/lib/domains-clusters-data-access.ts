import { type ClusterDeleteMode, ClustersApi } from 'qovery-typescript-axios'

const clusterApi = new ClustersApi()

export interface DeleteClusterProps {
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
