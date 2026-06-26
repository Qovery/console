type ClusterRegionWithArmSupport = {
  name: string
  arm_supported?: boolean
}

type CpuArchitectureCluster = {
  cloud_provider?: string
  region?: string
}

type CpuArchitectureCloudProvider = {
  short_name?: string
  regions?: ClusterRegionWithArmSupport[]
}

type CpuArchitectureService = {
  serviceType?: string
}

type CpuArchitectureDeploymentStatus = {
  state?: string
}

export function canChooseCpuArchitecture({
  service,
  cluster,
  cloudProviders = [],
  deploymentStatus,
}: {
  service?: CpuArchitectureService
  cluster?: CpuArchitectureCluster
  cloudProviders?: CpuArchitectureCloudProvider[]
  deploymentStatus?: CpuArchitectureDeploymentStatus | null
}) {
  const clusterProvider = cluster?.cloud_provider
  const targetProvider = cloudProviders.find((provider) => provider.short_name === clusterProvider)
  const clusterRegion = targetProvider?.regions?.find((region) => region.name === cluster?.region)
  const isSettingsPage = Boolean(service)
  const isSupportedCloudProvider = clusterProvider === 'GCP' || clusterProvider === 'AWS'
  const isSupportedServiceType =
    service?.serviceType === 'APPLICATION' || service?.serviceType === 'CONTAINER' || service?.serviceType === 'JOB'
  const isServiceDeployed = deploymentStatus?.state === 'DEPLOYED'

  return (
    isSettingsPage &&
    isSupportedCloudProvider &&
    clusterRegion?.arm_supported === true &&
    isSupportedServiceType &&
    isServiceDeployed
  )
}
