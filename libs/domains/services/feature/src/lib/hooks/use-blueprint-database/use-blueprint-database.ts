import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

const ENDPOINT_POLL_INTERVAL_MS = 10_000

export interface UseBlueprintDatabaseProps {
  blueprintId: string
  enabled?: boolean
}

export function useBlueprintDatabase({ blueprintId, enabled = true }: UseBlueprintDatabaseProps) {
  return useQuery({
    ...queries.services.blueprintDatabase({ blueprintId }),
    enabled: enabled && Boolean(blueprintId),
    // 404 means the blueprint is not a database: an answer, not a failure to retry
    retry: false,
    // A database deployed while the page is open reports its endpoint only once its deploy ends
    refetchInterval: (data) => (data && !data.endpoint ? ENDPOINT_POLL_INTERVAL_MS : false),
  })
}

export default useBlueprintDatabase
