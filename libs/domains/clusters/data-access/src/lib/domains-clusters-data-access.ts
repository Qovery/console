import { ClustersApi } from 'qovery-typescript-axios'

const clusterApi = new ClustersApi()

export const mutations = {
  async deleteCluster({ organizationId, clusterId }: { organizationId: string; clusterId: string }) {
    const response = await clusterApi.deleteCluster(organizationId, clusterId)
    return response.data
  },
}
