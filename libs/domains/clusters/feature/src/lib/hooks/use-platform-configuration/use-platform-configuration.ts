import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UsePlatformConfigurationProps {
  clusterId: string
  enabled?: boolean
  suspense?: boolean
}

export function usePlatformConfiguration({
  clusterId,
  enabled = true,
  suspense = false,
}: UsePlatformConfigurationProps) {
  return useQuery({
    ...queries.platformConfiguration.configuration({ clusterId }),
    enabled: enabled && Boolean(clusterId),
    suspense,
  })
}
