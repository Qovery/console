import { useQuery } from '@tanstack/react-query'
import { type PlatformComponentConfigurationPreviewRequest } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

interface UsePlatformComponentConfigurationProps {
  organizationId: string
  clusterId: string
  componentKey?: string
  request: PlatformComponentConfigurationPreviewRequest
  enabled?: boolean
}

export function usePlatformComponentConfiguration({
  organizationId,
  clusterId,
  componentKey,
  request,
  enabled = true,
}: UsePlatformComponentConfigurationProps) {
  return useQuery({
    ...queries.platformConfiguration.componentConfiguration({
      organizationId,
      clusterId,
      componentKey: componentKey ?? '',
      request,
    }),
    enabled: enabled && Boolean(organizationId) && Boolean(clusterId) && Boolean(componentKey),
    keepPreviousData: true,
  })
}
