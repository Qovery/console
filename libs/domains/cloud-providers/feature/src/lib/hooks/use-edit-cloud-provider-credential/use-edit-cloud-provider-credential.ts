import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/cloud-providers/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditCloudProviderCredential() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editCloudProviderCredential, {
    onSuccess(_, { organizationId, cloudProvider }) {
      queryClient.invalidateQueries({
        queryKey: queries.cloudProviders.credentials({ organizationId, cloudProvider }).queryKey,
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
