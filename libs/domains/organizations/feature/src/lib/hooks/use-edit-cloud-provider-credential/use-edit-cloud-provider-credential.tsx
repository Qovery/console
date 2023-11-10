import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseEditCloudProviderCredentialProps {
  organizationId: string
  cloudProvider: CloudProviderEnum
}

export function useEditCloudProviderCredential({ organizationId, cloudProvider }: UseEditCloudProviderCredentialProps) {
  const queryClient = useQueryClient()

  return useMutation(mutations.editCloudProviderCredential, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.cloudProviderCredentials({ organizationId, cloudProvider }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your credential has been edited',
      },
      notifyOnError: true,
    },
  })
}

export default useEditCloudProviderCredential
