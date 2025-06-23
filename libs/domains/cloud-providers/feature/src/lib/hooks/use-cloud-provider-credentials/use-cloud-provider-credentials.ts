import { useQuery } from '@tanstack/react-query'
import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export interface UseCloudProviderCredentialsProps {
  organizationId: string
  cloudProvider?: CloudProviderEnum
}

export function useCloudProviderCredentials({ organizationId, cloudProvider }: UseCloudProviderCredentialsProps) {
  return useQuery({
    ...queries.cloudProviders.credentials({ organizationId, cloudProvider: cloudProvider! }),
    select(data) {
      if (!data) {
        return data
      }
      return data.sort((a, b) => a.name.localeCompare(b.name))
    },
    enabled: !!cloudProvider,
  })
}

export default useCloudProviderCredentials
