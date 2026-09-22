import { useQueries } from '@tanstack/react-query'
import { type PlatformComponentConfigurationPreviewRequest } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

interface UsePlatformComponentConfigurationsProps {
  organizationId: string
  clusterId: string
  requests: Record<string, PlatformComponentConfigurationPreviewRequest>
  enabled?: boolean
}

export function usePlatformComponentConfigurations({
  organizationId,
  clusterId,
  requests,
  enabled = true,
}: UsePlatformComponentConfigurationsProps) {
  const componentKeys = Object.keys(requests)

  return useQueries({
    queries: componentKeys.map((componentKey) => ({
      ...queries.platformConfiguration.componentConfiguration({
        organizationId,
        clusterId,
        componentKey,
        request: requests[componentKey],
      }),
      enabled: enabled && Boolean(organizationId) && Boolean(clusterId) && Boolean(componentKey),
      keepPreviousData: true,
    })),
  })
}
