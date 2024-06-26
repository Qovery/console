import { useQuery } from '@tanstack/react-query'
import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

interface UseCloudProviderFeaturesProps {
  cloudProvider: CloudProviderEnum
}

export function useCloudProviderFeatures({ cloudProvider }: UseCloudProviderFeaturesProps) {
  return useQuery({
    ...queries.cloudProviders.features({ cloudProvider }),
    select(features) {
      return features?.filter(({ id }) => id !== 'EXISTING_VPC' && id !== 'KARPENTER')
    },
  })
}

export default useCloudProviderFeatures
