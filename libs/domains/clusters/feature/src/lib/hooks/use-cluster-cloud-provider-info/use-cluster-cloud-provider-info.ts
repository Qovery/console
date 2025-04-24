import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterCloudProviderInfoProps {
  organizationId: string
  clusterId: string
  disabled?: boolean
}

export function useClusterCloudProviderInfo({ organizationId, clusterId, disabled }: UseClusterCloudProviderInfoProps) {
  return useQuery({
    ...queries.clusters.cloudProviderInfo({ organizationId, clusterId }),
    enabled: !disabled,
  })
}

export default useClusterCloudProviderInfo
