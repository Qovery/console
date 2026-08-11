import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeletePolicyApiToken() {
  const queryClient = useQueryClient()

  return useMutation(mutations.deletePolicyApiToken, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.policyApiTokens({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: { title: 'Your policy api token is being deleted' },
      notifyOnError: true,
    },
  })
}

export default useDeletePolicyApiToken
