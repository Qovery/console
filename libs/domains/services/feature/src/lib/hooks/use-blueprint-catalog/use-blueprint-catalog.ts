import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseBlueprintCatalogProps {
  organizationId: string
  enabled?: boolean
  suspense?: boolean
}

export function useBlueprintCatalog({ organizationId, enabled = true, suspense = false }: UseBlueprintCatalogProps) {
  return useQuery({
    ...queries.services.blueprintCatalog({ organizationId }),
    enabled: enabled && Boolean(organizationId),
    suspense,
  })
}

export default useBlueprintCatalog
