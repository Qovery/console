import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseListDatabaseConfigurationsProps {
  environmentId: string
}

export function useListDatabaseConfigurations({ environmentId }: UseListDatabaseConfigurationsProps) {
  return useQuery({
    ...queries.environments.listDatabaseConfigurations({ environmentId }),
  })
}

export default useListDatabaseConfigurations
