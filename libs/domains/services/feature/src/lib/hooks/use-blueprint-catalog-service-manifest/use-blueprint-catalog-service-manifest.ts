import { useQuery } from '@tanstack/react-query'
import {
  type GetBlueprintCatalogServiceManifest200Response,
  type GetBlueprintCatalogServiceManifest200ResponseResultsInner,
} from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export interface UseBlueprintCatalogServiceManifestProps {
  organizationId: string
  provider: string
  serviceFamily: string
  serviceVersion: string
  enabled?: boolean
  suspense?: boolean
}

export function useBlueprintCatalogServiceManifest({
  organizationId,
  provider,
  serviceFamily,
  serviceVersion,
  enabled = true,
  suspense = false,
}: UseBlueprintCatalogServiceManifestProps) {
  return useQuery({
    ...queries.services.blueprintCatalogServiceManifest({ organizationId, provider, serviceFamily, serviceVersion }),
    select: (
      manifest:
        | GetBlueprintCatalogServiceManifest200Response
        | GetBlueprintCatalogServiceManifest200ResponseResultsInner[]
    ) => (Array.isArray(manifest) ? manifest : manifest.results ?? []),
    enabled:
      enabled && Boolean(organizationId) && Boolean(provider) && Boolean(serviceFamily) && Boolean(serviceVersion),
    suspense,
  })
}

export default useBlueprintCatalogServiceManifest
