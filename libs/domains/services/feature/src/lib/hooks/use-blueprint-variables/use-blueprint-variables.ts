import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseBlueprintVariablesProps {
  blueprintId: string
  enabled?: boolean
  suspense?: boolean
}

export function useBlueprintVariables({ blueprintId, enabled = true, suspense = true }: UseBlueprintVariablesProps) {
  return useQuery({
    ...queries.services.blueprintVariables({ blueprintId }),
    enabled: enabled && Boolean(blueprintId),
    suspense,
    staleTime: 0,
  })
}

export default useBlueprintVariables
