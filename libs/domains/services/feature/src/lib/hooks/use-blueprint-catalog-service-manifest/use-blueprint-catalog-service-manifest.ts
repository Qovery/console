import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseBlueprintCatalogServiceManifestProps {
  organizationId: string
  provider: string
  serviceFamily: string
  serviceVersion: string
  environmentId?: string
  enabled?: boolean
  suspense?: boolean
}

export function useBlueprintCatalogServiceManifest({
  organizationId,
  provider,
  serviceFamily,
  serviceVersion,
  environmentId = '',
  enabled = true,
  suspense = false,
}: UseBlueprintCatalogServiceManifestProps) {
  return useQuery({
    ...queries.services.blueprintCatalogServiceManifest({
      organizationId,
      provider,
      serviceFamily,
      serviceVersion,
      environmentId,
    }),
    enabled:
      enabled &&
      Boolean(organizationId) &&
      Boolean(provider) &&
      Boolean(serviceFamily) &&
      Boolean(serviceVersion) &&
      Boolean(environmentId),
    suspense,
  })
}

export default useBlueprintCatalogServiceManifest
