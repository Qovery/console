import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useCloudProviderInstanceTypes(args: Parameters<typeof queries.cloudProviders.listInstanceTypes>[0]) {
  return useQuery({
    ...queries.cloudProviders.listInstanceTypes(args),
  })
}

export default useCloudProviderInstanceTypes
