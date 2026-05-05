import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useCloudProviders({ suspense = false }: { suspense?: boolean } = {}) {
  return useQuery({
    ...queries.cloudProviders.list,
    suspense,
  })
}

export default useCloudProviders
