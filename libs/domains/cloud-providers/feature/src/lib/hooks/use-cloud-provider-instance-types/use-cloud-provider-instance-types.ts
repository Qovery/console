import { useQuery } from '@tanstack/react-query'
import { type CloudProviderEnum, type KubernetesEnum } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

type UseCloudProviderInstanceTypesProps =
  | {
      cloudProvider: Extract<CloudProviderEnum, 'AWS'>
      clusterType: keyof typeof KubernetesEnum
      region: string
    }
  | {
      cloudProvider: Extract<CloudProviderEnum, 'SCW'>
      clusterType: Extract<KubernetesEnum, 'MANAGED'>
      region: string
    }

export function useCloudProviderInstanceTypes(arg: UseCloudProviderInstanceTypesProps) {
  return useQuery({
    ...queries.cloudProviders.listInstanceTypes(arg),
  })
}

export default useCloudProviderInstanceTypes
