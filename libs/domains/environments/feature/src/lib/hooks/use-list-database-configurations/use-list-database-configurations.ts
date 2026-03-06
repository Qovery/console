import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseListDatabaseConfigurationsProps {
  environmentId: string
  enabled?: boolean
  suspense?: boolean
}

export function useListDatabaseConfigurations({
  environmentId,
  enabled = false,
  suspense = false,
}: UseListDatabaseConfigurationsProps) {
  return useQuery({
    ...queries.environments.listDatabaseConfigurations({ environmentId }),
    enabled,
    suspense,
  })
}

export default useListDatabaseConfigurations
