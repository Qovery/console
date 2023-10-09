import { ClustersApi } from 'qovery-typescript-axios'

const clusterApi = new ClustersApi()

export interface DeleteClusterProps {
  organizationId: string
  clusterId: string
}

export const mutations = {
  async deleteCluster({ organizationId, clusterId }: DeleteClusterProps) {
    const response = await clusterApi.deleteCluster(organizationId, clusterId)
    return response.data
  },
}
