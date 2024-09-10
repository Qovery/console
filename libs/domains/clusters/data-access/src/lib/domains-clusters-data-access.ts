import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  type ClusterAdvancedSettings,
  type ClusterCloudProviderInfoRequest,
  type ClusterDeleteMode,
  type ClusterRequest,
  type ClusterRoutingTableRequest,
  ClustersApi,
} from 'qovery-typescript-axios'

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
  routingTable: ({ organizationId, clusterId }: { organizationId: string; clusterId: string }) => ({
    queryKey: [organizationId, clusterId],
    async queryFn() {
      const response = await clusterApi.getRoutingTable(organizationId, clusterId)
      return response.data.results
    },
  }),
  cloudProviderInfo: ({ organizationId, clusterId }: { organizationId: string; clusterId: string }) => ({
    queryKey: [organizationId, clusterId],
    async queryFn() {
      const response = await clusterApi.getOrganizationCloudProviderInfo(organizationId, clusterId)
      return response.data
    },
  }),
  advancedSettings: ({ organizationId, clusterId }: { organizationId: string; clusterId: string }) => ({
    queryKey: [organizationId, clusterId],
    async queryFn() {
      const response = await clusterApi.getClusterAdvancedSettings(organizationId, clusterId)
      return response.data
    },
  }),
  defaultAdvancedSettings: {
    queryKey: null,
    async queryFn() {
      const response = await clusterApi.getDefaultClusterAdvancedSettings()
      return response.data
    },
  },
  logs: ({ organizationId, clusterId }: { organizationId: string; clusterId: string }) => ({
    queryKey: [organizationId, clusterId],
    async queryFn() {
      const response = await clusterApi.listClusterLogs(organizationId, clusterId)
      return response.data.results
    },
  }),
  kubeconfig: ({ organizationId, clusterId }: { organizationId: string; clusterId: string }) => ({
    queryKey: [organizationId, clusterId],
    async queryFn() {
      const response = await clusterApi.getClusterKubeconfig(organizationId, clusterId)
      return response.data
    },
  }),
})

export const mutations = {
  async createCluster({ organizationId, clusterRequest }: { organizationId: string; clusterRequest: ClusterRequest }) {
    const response = await clusterApi.createCluster(organizationId, clusterRequest)
    return response.data
  },
  async editCluster({
    organizationId,
    clusterId,
    clusterRequest,
  }: {
    organizationId: string
    clusterId: string
    clusterRequest: ClusterRequest
  }) {
    const response = await clusterApi.editCluster(organizationId, clusterId, clusterRequest)
    return response.data
  },
  async deleteCluster({
    organizationId,
    clusterId,
    clusterDeleteMode,
  }: {
    organizationId: string
    clusterId: string
    clusterDeleteMode: ClusterDeleteMode
  }) {
    const response = await clusterApi.deleteCluster(organizationId, clusterId, clusterDeleteMode)
    return response.data
  },
  async deployCluster({ organizationId, clusterId }: { organizationId: string; clusterId: string }) {
    const response = await clusterApi.deployCluster(organizationId, clusterId)
    return response.data
  },
  async stopCluster({ organizationId, clusterId }: { organizationId: string; clusterId: string }) {
    const response = await clusterApi.stopCluster(organizationId, clusterId)
    return response.data
  },
  async editAdvancedSettings({
    organizationId,
    clusterId,
    clusterAdvancedSettings,
  }: {
    organizationId: string
    clusterId: string
    clusterAdvancedSettings: ClusterAdvancedSettings
  }) {
    const response = await clusterApi.editClusterAdvancedSettings(organizationId, clusterId, clusterAdvancedSettings)
    return response.data
  },
  async editCloudProviderInfo({
    organizationId,
    clusterId,
    cloudProviderInfoRequest,
  }: {
    organizationId: string
    clusterId: string
    cloudProviderInfoRequest: ClusterCloudProviderInfoRequest
  }) {
    const response = await clusterApi.specifyClusterCloudProviderInfo(
      organizationId,
      clusterId,
      cloudProviderInfoRequest
    )
    return response.data
  },
  async editRoutingTable({
    organizationId,
    clusterId,
    routingTableRequest,
  }: {
    organizationId: string
    clusterId: string
    routingTableRequest: ClusterRoutingTableRequest
  }) {
    const response = await clusterApi.editRoutingTable(organizationId, clusterId, routingTableRequest)
    return response.data
  },
  async kubeconfig({ organizationId, clusterId }: { organizationId: string; clusterId: string }) {
    const response = await clusterApi.getClusterKubeconfig(organizationId, clusterId)
    return response.data
  },
  async editKubeconfig({
    organizationId,
    clusterId,
    payload,
  }: {
    organizationId: string
    clusterId: string
    payload: string
  }) {
    const response = await clusterApi.editClusterKubeconfig(organizationId, clusterId, payload)
    return response.data
  },
  async installationHelmValues({ organizationId, clusterId }: { organizationId: string; clusterId: string }) {
    const response = await clusterApi.getInstallationHelmValues(organizationId, clusterId)
    return response.data
  },
  async upgradeCluster({ clusterId }: { clusterId: string }) {
    const response = await clusterApi.upgradeCluster(clusterId)
    return response.data
  },
}
