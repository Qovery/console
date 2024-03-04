import { useQuery } from '@tanstack/react-query'
import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

interface UseCloudProviderFeaturesProps {
  cloudProvider: CloudProviderEnum
  enabled?: boolean
}

export function useCloudProviderFeatures({ cloudProvider, enabled = true }: UseCloudProviderFeaturesProps) {
  return useQuery({
    ...queries.cloudProviders.features({ cloudProvider }),
    select(features) {
      // TODO: hide existing VPC feature for now
      return features?.filter(({ id }) => id !== 'EXISTING_VPC')
    },
    enabled,
  })
}

export default useCloudProviderFeatures
