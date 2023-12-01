import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterCloudProviderInfoProps {
  organizationId: string
  clusterId: string
}

export function useClusterCloudProviderInfo({ organizationId, clusterId }: UseClusterCloudProviderInfoProps) {
  return useQuery({
    ...queries.clusters.cloudProviderInfo({ organizationId, clusterId }),
  })
}

export default useClusterCloudProviderInfo
