import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseBlueprintUpdateProps {
  blueprintId: string
  enabled?: boolean
  suspense?: boolean
}

export function useBlueprintUpdate({ blueprintId, enabled = true, suspense = false }: UseBlueprintUpdateProps) {
  return useQuery({
    ...queries.services.blueprintUpdate({ blueprintId }),
    enabled,
    suspense,
  })
}

export default useBlueprintUpdate
