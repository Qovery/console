import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { queries } from '@qovery/state/util-queries'

const MAX_RETRIES = 2

export interface UseBlueprintDatabaseMasterCredentialsProps {
  blueprintId: string
  enabled?: boolean
}

export function useBlueprintDatabaseMasterCredentials({
  blueprintId,
  enabled = true,
}: UseBlueprintDatabaseMasterCredentialsProps) {
  return useQuery({
    ...queries.services.blueprintDatabaseMasterCredentials({ blueprintId }),
    enabled: enabled && Boolean(blueprintId),
    // A 4xx is an answer (403: no access, 404: not reported yet), only a server or network failure is worth retrying
    retry: (failureCount, error) =>
      isAxiosError(error) && error.response && error.response.status < 500 ? false : failureCount < MAX_RETRIES,
  })
}

export default useBlueprintDatabaseMasterCredentials
