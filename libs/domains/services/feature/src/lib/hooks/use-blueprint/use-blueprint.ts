import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseBlueprintProps {
  blueprintId: string
  enabled?: boolean
  refetchInterval?: number | false
}

/**
 * Asks the API what actually happened to a blueprint: whether its service exists and how its
 * latest deployment ended. Callers rely on it to reconcile state the websocket never delivered,
 * so the answer must always come from the server rather than from the global 60s cache.
 */
export function useBlueprint({ blueprintId, enabled = true, refetchInterval }: UseBlueprintProps) {
  return useQuery({
    ...queries.services.blueprint({ blueprintId }),
    enabled: enabled && Boolean(blueprintId),
    refetchInterval,
    staleTime: 0,
  })
}

export default useBlueprint
