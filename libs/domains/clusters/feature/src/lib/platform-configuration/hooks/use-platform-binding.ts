import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UsePlatformBindingProps {
  organizationId: string
  clusterId: string
  enabled?: boolean
  suspense?: boolean
}

export function usePlatformBinding({
  organizationId,
  clusterId,
  enabled = true,
  suspense = false,
}: UsePlatformBindingProps) {
  return useQuery({
    ...queries.platformConfiguration.binding({ organizationId, clusterId }),
    enabled: enabled && Boolean(organizationId) && Boolean(clusterId),
    suspense,
  })
}
