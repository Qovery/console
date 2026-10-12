import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type ClusterCredentials } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/cloud-providers/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateCloudProviderCredential() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createCloudProviderCredential, {
    onSuccess(credential, { organizationId, cloudProvider }) {
      if (credential)
        queryClient.setQueryData<ClusterCredentials[]>(
          queries.cloudProviders.credentials({ organizationId, cloudProvider }).queryKey,
          (credentials = []) => [...credentials.filter(({ id }) => id !== credential.id), credential]
        )
      queryClient.invalidateQueries({
        queryKey: queries.cloudProviders.credentials({ organizationId, cloudProvider }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.organizations.listCredentials({ organizationId }).queryKey,
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
