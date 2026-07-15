import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  type ClusterPlatformConfigurationRequest,
  type PlatformCloudVendor,
  type PlatformClusterMode,
  type PlatformComponentConfigurationPreviewRequest,
  PlatformConfigurationApi,
} from 'qovery-typescript-axios'
import { isHttpStatus } from '../http/is-http-status'

const platformConfigurationApi = new PlatformConfigurationApi()

export const platformConfiguration = createQueryKeys('platformConfiguration', {
  templates: ({
    organizationId,
    clusterMode,
    cloudProvider,
  }: {
    organizationId: string
    clusterMode?: PlatformClusterMode
    cloudProvider?: PlatformCloudVendor
  }) => ({
    queryKey: [organizationId, clusterMode, cloudProvider],
    async queryFn() {
      const response = await platformConfigurationApi.listPlatformTemplates(organizationId, clusterMode, cloudProvider)
      return response.data.results
    },
  }),
  clusterConfiguration: ({ clusterId }: { clusterId: string }) => ({
    queryKey: [clusterId],
    async queryFn() {
      try {
        const response = await platformConfigurationApi.getClusterPlatformConfiguration(clusterId)
        return response.data
      } catch (error) {
        if (isHttpStatus(error, 404)) return null
        throw error
      }
    },
  }),
  componentConfiguration: ({
    clusterId,
    componentKey,
    request,
  }: {
    clusterId: string
    componentKey: string
    request: PlatformComponentConfigurationPreviewRequest
  }) => ({
    queryKey: [clusterId, componentKey, request],
    async queryFn() {
      const response = await platformConfigurationApi.resolveClusterPlatformComponentConfiguration(
        clusterId,
        componentKey,
        request
      )
      return response.data
    },
  }),
  templateComponentConfiguration: ({
    organizationId,
    templateKey,
    templateVersion,
    componentKey,
    clusterMode,
    cloudProvider,
    request,
  }: {
    organizationId: string
    templateKey: string
    templateVersion: string
    componentKey: string
    clusterMode: PlatformClusterMode
    cloudProvider: PlatformCloudVendor
    request: PlatformComponentConfigurationPreviewRequest
  }) => ({
    queryKey: [organizationId, templateKey, templateVersion, componentKey, clusterMode, cloudProvider, request],
    async queryFn() {
      const response = await platformConfigurationApi.resolvePlatformTemplateComponentConfiguration(
        organizationId,
        templateKey,
        templateVersion,
        componentKey,
        clusterMode,
        cloudProvider,
        request
      )
      return response.data
    },
  }),
})

export const platformConfigurationMutations = {
  async updateClusterConfiguration({
    clusterId,
    request,
  }: {
    clusterId: string
    request: ClusterPlatformConfigurationRequest
  }) {
    const response = await platformConfigurationApi.updateClusterPlatformConfiguration(clusterId, request)
    return response.data
  },
}
