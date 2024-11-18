import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

type ListInstanceTypesParameters = {
  region: string
}

export type UseCloudProviderInstanceTypesKarpenterProps = {
  enabled?: boolean
  region: string
}

export function useCloudProviderInstanceTypesKarpenter({
  enabled = true,
  region,
}: UseCloudProviderInstanceTypesKarpenterProps) {
  return useQuery({
    ...queries.cloudProviders.listInstanceTypesKarpenter({
      cloudProvider: 'AWS',
      region,
    } as Parameters<typeof queries.cloudProviders.listInstanceTypesKarpenter>[0]),
    enabled,
  })
}

export default useCloudProviderInstanceTypesKarpenter
