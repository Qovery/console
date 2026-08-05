import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreatePolicyApiToken() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createPolicyApiToken, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.policyApiTokens({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: { title: 'Your policy api token has been created' },
      notifyOnError: true,
    },
  })
}

export default useCreatePolicyApiToken
