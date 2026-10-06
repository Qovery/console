import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { queries } from '@qovery/state/util-queries'

const ENDPOINT_POLL_INTERVAL_MS = 10_000
const MAX_RETRIES = 2

export interface UseBlueprintDatabaseProps {
  blueprintId: string
  enabled?: boolean
}

export function useBlueprintDatabase({ blueprintId, enabled = true }: UseBlueprintDatabaseProps) {
  return useQuery({
    ...queries.services.blueprintDatabase({ blueprintId }),
    enabled: enabled && Boolean(blueprintId),
    // A 4xx is an answer (404: not a database), only a server or network failure is worth retrying
    retry: (failureCount, error) =>
      isAxiosError(error) && error.response && error.response.status < 500 ? false : failureCount < MAX_RETRIES,
    // A database deployed while the page is open reports its endpoint only once its deploy ends
    refetchInterval: (data) => (data && !data.endpoint ? ENDPOINT_POLL_INTERVAL_MS : false),
  })
}

export default useBlueprintDatabase
