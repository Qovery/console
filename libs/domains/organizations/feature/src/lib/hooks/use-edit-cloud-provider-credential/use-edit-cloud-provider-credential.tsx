import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditCloudProviderCredential() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editCloudProviderCredential, {
    onSuccess(_, { organizationId, cloudProvider }) {
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
