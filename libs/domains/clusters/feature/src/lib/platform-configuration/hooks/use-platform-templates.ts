import { useQuery } from '@tanstack/react-query'
import { type PlatformCloudVendor, type PlatformClusterMode } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

interface UsePlatformTemplatesProps {
  organizationId: string
  clusterMode?: PlatformClusterMode
  cloudProvider?: PlatformCloudVendor
  enabled?: boolean
  suspense?: boolean
}

export function usePlatformTemplates({
  organizationId,
  clusterMode,
  cloudProvider,
  enabled = true,
  suspense = false,
}: UsePlatformTemplatesProps) {
  return useQuery({
    ...queries.platformConfiguration.templates({ organizationId, clusterMode, cloudProvider }),
    enabled: enabled && Boolean(organizationId),
    suspense,
  })
}
