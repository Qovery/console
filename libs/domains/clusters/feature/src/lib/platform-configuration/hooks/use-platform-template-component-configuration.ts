import { useQuery } from '@tanstack/react-query'
import {
  type PlatformCloudVendor,
  type PlatformClusterMode,
  type PlatformComponentConfigurationPreviewRequest,
} from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

interface UsePlatformTemplateComponentConfigurationProps {
  organizationId: string
  templateKey?: string
  templateVersion?: string
  componentKey?: string
  clusterMode: PlatformClusterMode
  cloudProvider: PlatformCloudVendor
  request: PlatformComponentConfigurationPreviewRequest
  enabled?: boolean
}

export function usePlatformTemplateComponentConfiguration({
  organizationId,
  templateKey,
  templateVersion,
  componentKey,
  clusterMode,
  cloudProvider,
  request,
  enabled = true,
}: UsePlatformTemplateComponentConfigurationProps) {
  return useQuery({
    ...queries.platformConfiguration.templateComponentConfiguration({
      organizationId,
      templateKey: templateKey ?? '',
      templateVersion: templateVersion ?? '',
      componentKey: componentKey ?? '',
      clusterMode,
      cloudProvider,
      request,
    }),
    enabled: enabled && Boolean(organizationId && templateKey && templateVersion && componentKey),
    keepPreviousData: true,
  })
}
