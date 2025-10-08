import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export type UseCloudProviderInstanceTypesKarpenterProps = {
  enabled?: boolean
  region: string
  withGpu?: boolean
}

export function useCloudProviderInstanceTypesKarpenter({
  enabled = true,
  region,
  withGpu = false,
}: UseCloudProviderInstanceTypesKarpenterProps) {
  return useQuery({
    ...queries.cloudProviders.listInstanceTypesKarpenter({
      cloudProvider: 'AWS',
      region,
      withGpu,
    } as Parameters<typeof queries.cloudProviders.listInstanceTypesKarpenter>[0]),
    enabled,
  })
}

export default useCloudProviderInstanceTypesKarpenter
