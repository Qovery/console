import { useQuery } from '@tanstack/react-query'
import { type BlueprintItem } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export interface UseBlueprintCatalogServiceReadmeProps {
  organizationId: string
  provider: string
  serviceFamily: BlueprintItem['serviceFamily']
  serviceVersion: string
  enabled?: boolean
  suspense?: boolean
}

export function useBlueprintCatalogServiceReadme({
  organizationId,
  provider,
  serviceFamily,
  serviceVersion,
  enabled = true,
  suspense = false,
}: UseBlueprintCatalogServiceReadmeProps) {
  return useQuery({
    ...queries.services.blueprintCatalogServiceReadme({ organizationId, provider, serviceFamily, serviceVersion }),
    enabled:
      enabled && Boolean(organizationId) && Boolean(provider) && Boolean(serviceFamily) && Boolean(serviceVersion),
    suspense,
  })
}

export default useBlueprintCatalogServiceReadme
