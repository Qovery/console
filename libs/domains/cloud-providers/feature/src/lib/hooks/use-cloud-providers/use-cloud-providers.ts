import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useCloudProviders() {
  return useQuery({
    ...queries.cloudProviders.list,
  })
}

export default useCloudProviders
