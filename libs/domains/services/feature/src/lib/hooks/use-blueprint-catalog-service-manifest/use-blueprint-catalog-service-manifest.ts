import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
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

export function usePrefetchBlueprintCatalogServiceManifest({
  organizationId,
  provider,
  serviceFamily,
  serviceVersion,
  environmentId = '',
}: UseBlueprintCatalogServiceManifestProps) {
  const queryClient = useQueryClient()

  return useCallback(async () => {
    if (!organizationId || !provider || !serviceFamily || !serviceVersion || !environmentId) {
      return
    }

    await queryClient.prefetchQuery(
      queries.services.blueprintCatalogServiceManifest({
        organizationId,
        provider,
        serviceFamily,
        serviceVersion,
        environmentId,
      })
    )
  }, [environmentId, organizationId, provider, queryClient, serviceFamily, serviceVersion])
}

export default useBlueprintCatalogServiceManifest
