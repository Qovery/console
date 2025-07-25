import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/cloud-providers/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteCloudProviderCredential() {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteCloudProviderCredential, {
    onSuccess(_, { organizationId, cloudProvider }) {
      queryClient.invalidateQueries({
        queryKey: queries.cloudProviders.credentials({ organizationId, cloudProvider }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.organizations.listCredentials({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your credential has been deleted',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteCloudProviderCredential
