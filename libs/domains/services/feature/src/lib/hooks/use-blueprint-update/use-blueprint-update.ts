import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseBlueprintUpdateProps {
  blueprintId?: string | null
  enabled?: boolean
  suspense?: boolean
}

export function useBlueprintUpdate({ blueprintId, enabled = true, suspense = false }: UseBlueprintUpdateProps) {
  return useQuery({
    ...queries.services.blueprintUpdate({ blueprintId: blueprintId ?? '' }),
    enabled: enabled && Boolean(blueprintId),
    suspense,
  })
}

export default useBlueprintUpdate
