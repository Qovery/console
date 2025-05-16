import { useQuery } from '@tanstack/react-query'
import { type CloudVendorEnum } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export type UseCloudProviderInstanceTypesKarpenterProps = {
  enabled?: boolean
  cloudProvider: CloudVendorEnum
  region: string
}

export function useCloudProviderInstanceTypesKarpenter({
  enabled = true,
  cloudProvider,
  region,
}: UseCloudProviderInstanceTypesKarpenterProps) {
  return useQuery({
    ...queries.cloudProviders.listInstanceTypesKarpenter({
      cloudProvider,
      region,
    } as Parameters<typeof queries.cloudProviders.listInstanceTypesKarpenter>[0]),
    enabled,
  })
}

export default useCloudProviderInstanceTypesKarpenter
