import { useQueries } from '@tanstack/react-query'
import { type PlatformComponentConfigurationPreviewRequest } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

interface UsePlatformComponentConfigurationsProps {
  clusterId: string
  requests: Record<string, PlatformComponentConfigurationPreviewRequest>
  enabled?: boolean
}

export function usePlatformComponentConfigurations({
  clusterId,
  requests,
  enabled = true,
}: UsePlatformComponentConfigurationsProps) {
  const componentKeys = Object.keys(requests)

  return useQueries({
    queries: componentKeys.map((componentKey) => ({
      ...queries.platformConfiguration.componentConfiguration({
        clusterId,
        componentKey,
        request: requests[componentKey],
      }),
      enabled: enabled && Boolean(clusterId) && Boolean(componentKey),
      keepPreviousData: true,
    })),
  })
}
