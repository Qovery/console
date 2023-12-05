import { useQuery } from '@tanstack/react-query'
import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

interface UseCloudProviderFeaturesProps {
  cloudProvider: CloudProviderEnum
}

export function useCloudProviderFeatures({ cloudProvider }: UseCloudProviderFeaturesProps) {
  return useQuery({
    ...queries.clusters.cloudProviderFeatures({ cloudProvider }),
  })
}

export default useCloudProviderFeatures
