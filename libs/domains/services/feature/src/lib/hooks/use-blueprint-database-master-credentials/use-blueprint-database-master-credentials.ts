import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

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
    retry: false,
  })
}

export default useBlueprintDatabaseMasterCredentials
