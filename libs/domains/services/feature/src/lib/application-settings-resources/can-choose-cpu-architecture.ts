import { match } from 'ts-pattern'
import { getKarpenterFeatureValue } from '@qovery/domains/clusters/feature'

type CpuArchitectureRequirement = {
  key?: string
  values?: string[]
}

type CpuArchitectureService = {
  serviceType?: string
}

type CpuArchitectureCluster = {
  cloud_provider?: string
  region?: string
  features?: Array<{
    id?: string
    value_object?: {
      value?: unknown
    } | null
    value?: unknown
  }>
}

type CpuArchitectureCloudProvider = {
  short_name?: string
  regions?: Array<{
    name?: string
    arm_supported?: boolean
  }>
}

export function canChooseCpuArchitecture({
  service,
  cluster,
  cloudProviders = [],
}: {
  service?: CpuArchitectureService
  cluster?: CpuArchitectureCluster
  cloudProviders?: CpuArchitectureCloudProvider[]
}) {
  const karpenterValue = getKarpenterFeatureValue(cluster)
  const architectureRequirement = karpenterValue?.qovery_node_pools?.requirements?.find(
    (requirement: CpuArchitectureRequirement) => requirement.key === 'Arch'
  )
  const architectures = [...new Set(architectureRequirement?.values?.filter(Boolean) ?? [])]
  const clusterProvider = cluster?.cloud_provider
  const isSupportedServiceType =
    !service ||
    service.serviceType === 'APPLICATION' ||
    service.serviceType === 'CONTAINER' ||
    service.serviceType === 'JOB'
  const gcpProvider = cloudProviders.find((provider) => provider.short_name === 'GCP')
  const gcpClusterRegion = gcpProvider?.regions?.find((region) => region.name === cluster?.region)
  const supportsMultipleArchitectures = match(clusterProvider)
    .with('GCP', () => gcpClusterRegion?.arm_supported === true)
    .with('AWS', () => architectures.length >= 2)
    .otherwise(() => false)

  return isSupportedServiceType && supportsMultipleArchitectures
}
