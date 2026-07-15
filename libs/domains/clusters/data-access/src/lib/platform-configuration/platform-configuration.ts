import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  type ClusterPlatformBindingRequest,
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
  binding: ({ organizationId, clusterId }: { organizationId: string; clusterId: string }) => ({
    queryKey: [organizationId, clusterId],
    async queryFn() {
      try {
        const response = await platformConfigurationApi.getClusterPlatformBinding(organizationId, clusterId)
        return response.data
      } catch (error) {
        if (isHttpStatus(error, 404)) return null
        throw error
      }
    },
  }),
  componentConfiguration: ({
    organizationId,
    clusterId,
    componentKey,
    request,
  }: {
    organizationId: string
    clusterId: string
    componentKey: string
    request: PlatformComponentConfigurationPreviewRequest
  }) => ({
    queryKey: [organizationId, clusterId, componentKey, request],
    async queryFn() {
      const response = await platformConfigurationApi.resolvePlatformComponentConfiguration(
        organizationId,
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
  async updateBinding({
    organizationId,
    clusterId,
    request,
  }: {
    organizationId: string
    clusterId: string
    request: ClusterPlatformBindingRequest
  }) {
    const response = await platformConfigurationApi.updateClusterPlatformBinding(organizationId, clusterId, request)
    return response.data
  },
}
