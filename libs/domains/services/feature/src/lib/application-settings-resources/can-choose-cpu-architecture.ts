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
  features?: Array<{
    id?: string
    value_object?: {
      value?: unknown
    } | null
    value?: unknown
  }>
}

export function canChooseCpuArchitecture({
  service,
  cluster,
}: {
  service?: CpuArchitectureService
  cluster?: CpuArchitectureCluster
}) {
  const karpenterValue = getKarpenterFeatureValue(cluster)
  const architectureRequirement = karpenterValue?.qovery_node_pools?.requirements?.find(
    (requirement: CpuArchitectureRequirement) => requirement.key === 'Arch'
  )
  const architectures = [...new Set(architectureRequirement?.values?.filter(Boolean) ?? [])]
  const clusterProvider = cluster?.cloud_provider
  const isSupportedCloudProvider = clusterProvider === 'GCP' || clusterProvider === 'AWS'
  const isSupportedServiceType =
    !service ||
    service.serviceType === 'APPLICATION' ||
    service.serviceType === 'CONTAINER' ||
    service.serviceType === 'JOB'

  return isSupportedCloudProvider && isSupportedServiceType && architectures.length >= 2
}
