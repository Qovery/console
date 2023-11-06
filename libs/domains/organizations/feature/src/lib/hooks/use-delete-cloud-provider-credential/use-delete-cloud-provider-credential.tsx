import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseDeleteCloudProviderCredentialProps {
  organizationId: string
  cloudProvider: CloudProviderEnum
}

export function useDeleteCloudProviderCredential({
  organizationId,
  cloudProvider,
}: UseDeleteCloudProviderCredentialProps) {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteCloudProviderCredential, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.cloudProviderCredentials({ organizationId, cloudProvider }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your Git token is being deleted',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteCloudProviderCredential
