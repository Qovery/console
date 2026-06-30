import { type CloudProvider, type Cluster, type ServiceTypeEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { getKarpenterFeatureValue } from '@qovery/domains/clusters/feature'

export function canChooseCpuArchitecture({
  serviceType,
  cluster,
  cloudProviders = [],
}: {
  serviceType?: ServiceTypeEnum
  cluster?: Cluster
  cloudProviders?: CloudProvider[]
}) {
  const karpenterValue = getKarpenterFeatureValue(cluster)
  const architectureRequirement = karpenterValue?.qovery_node_pools?.requirements?.find(
    (requirement) => requirement.key === 'Arch'
  )
  const architectures = [...new Set(architectureRequirement?.values?.filter(Boolean) ?? [])]
  const clusterProvider = cluster?.cloud_provider
  const isSupportedServiceType =
    serviceType === undefined || serviceType === 'APPLICATION' || serviceType === 'CONTAINER' || serviceType === 'JOB'
  const gcpProvider = cloudProviders.find((provider) => provider.short_name === 'GCP')
  const gcpClusterRegion = gcpProvider?.regions?.find((region) => region.name === cluster?.region)
  const supportsMultipleArchitectures = match(clusterProvider)
    .with('GCP', () => gcpClusterRegion?.arm_supported === true)
    .with('AWS', () => architectures.length >= 2)
    .otherwise(() => false)

  return isSupportedServiceType && supportsMultipleArchitectures
}
