import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseCreateCloudProviderCredentialProps {
  organizationId: string
  cloudProvider: CloudProviderEnum
}

export function useCreateCloudProviderCredential({
  organizationId,
  cloudProvider,
}: UseCreateCloudProviderCredentialProps) {
  const queryClient = useQueryClient()

  return useMutation(mutations.createCloudProviderCredential, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.cloudProviderCredentials({ organizationId, cloudProvider }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your credential has been created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateCloudProviderCredential
