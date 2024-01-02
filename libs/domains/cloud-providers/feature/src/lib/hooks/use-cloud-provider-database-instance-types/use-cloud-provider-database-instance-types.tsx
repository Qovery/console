import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useCloudProviderDatabaseInstanceTypes(
  args: Parameters<typeof queries.cloudProviders.listDatabaseInstanceTypes>[0]
) {
  return useQuery({
    ...queries.cloudProviders.listDatabaseInstanceTypes(args),
  })
}

export default useCloudProviderDatabaseInstanceTypes
