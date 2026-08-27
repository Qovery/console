import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseBlueprintUpdateProps {
  blueprintId: string
  enabled?: boolean
  suspense?: boolean
  useErrorBoundary?: boolean
}

export function useBlueprintUpdate({
  blueprintId,
  enabled = true,
  suspense = false,
  useErrorBoundary,
}: UseBlueprintUpdateProps) {
  return useQuery({
    ...queries.services.blueprintUpdate({ blueprintId }),
    enabled,
    suspense,
    useErrorBoundary,
    // The endpoint resolves the service tag against the catalog: a failure means the tag is not
    // published there (prerelease or retired), which retrying cannot change.
    retry: false,
  })
}

export default useBlueprintUpdate
