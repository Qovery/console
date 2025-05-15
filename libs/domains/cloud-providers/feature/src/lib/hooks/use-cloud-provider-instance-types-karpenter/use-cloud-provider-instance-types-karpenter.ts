import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'
import { CloudVendorEnum } from 'qovery-typescript-axios'

type ListInstanceTypesParameters = {
  region: string
}

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
      cloudProvider: cloudProvider,
      region,
    } as Parameters<typeof queries.cloudProviders.listInstanceTypesKarpenter>[0]),
    enabled,
  })
}

export default useCloudProviderInstanceTypesKarpenter
