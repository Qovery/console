import { useQuery } from '@tanstack/react-query'
import { ListAWSEKSInstanceTypeGpuEnum } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export type UseCloudProviderInstanceTypesKarpenterProps = {
  enabled?: boolean
  region: string
  gpuFilter?: ListAWSEKSInstanceTypeGpuEnum
}

export function useCloudProviderInstanceTypesKarpenter({
  enabled = true,
  region,
  gpuFilter = ListAWSEKSInstanceTypeGpuEnum.EXCLUDE,
}: UseCloudProviderInstanceTypesKarpenterProps) {
  return useQuery({
    ...queries.cloudProviders.listInstanceTypesKarpenter({
      cloudProvider: 'AWS',
      region,
      gpuFilter,
    } as Parameters<typeof queries.cloudProviders.listInstanceTypesKarpenter>[0]),
    enabled,
  })
}

export default useCloudProviderInstanceTypesKarpenter
