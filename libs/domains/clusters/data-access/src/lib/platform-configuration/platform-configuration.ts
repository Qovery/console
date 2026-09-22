import { createQueryKeys } from '@lukemorales/query-key-factory'
import { type PlatformCloudVendor, type PlatformClusterMode, PlatformConfigurationApi } from 'qovery-typescript-axios'

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
})
