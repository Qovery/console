import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterPlatformConfigurationProps {
  clusterId: string
  enabled?: boolean
  suspense?: boolean
}

export function useClusterPlatformConfiguration({
  clusterId,
  enabled = true,
  suspense = false,
}: UseClusterPlatformConfigurationProps) {
  return useQuery({
    ...queries.platformConfiguration.clusterConfiguration({ clusterId }),
    enabled: enabled && Boolean(clusterId),
    suspense,
  })
}
