import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useCloudProviderInstanceTypes(arg: Parameters<typeof queries.cloudProviders.listInstanceTypes>[0]) {
  return useQuery({
    ...queries.cloudProviders.listInstanceTypes(arg),
  })
}

export default useCloudProviderInstanceTypes
