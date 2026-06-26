type CpuArchitectureRequirement = {
  key?: string
  values?: string[]
}

type CpuArchitectureService = {
  serviceType?: string
}

type CpuArchitectureKarpenterValue = {
  qovery_node_pools?: {
    requirements?: CpuArchitectureRequirement[]
  }
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

function isKarpenterValue(value: unknown): value is CpuArchitectureKarpenterValue {
  return Boolean(value && typeof value === 'object' && 'qovery_node_pools' in value)
}

export function canChooseCpuArchitecture({
  service,
  cluster,
}: {
  service?: CpuArchitectureService
  cluster?: CpuArchitectureCluster
}) {
  const karpenterFeature = cluster?.features?.find((feature) => feature.id === 'KARPENTER')
  const rawKarpenterValue = karpenterFeature?.value_object?.value ?? karpenterFeature?.value
  const karpenterValue = isKarpenterValue(rawKarpenterValue) ? rawKarpenterValue : undefined
  const architectureRequirement = karpenterValue?.qovery_node_pools?.requirements?.find(
    (requirement) => requirement.key === 'Arch'
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
