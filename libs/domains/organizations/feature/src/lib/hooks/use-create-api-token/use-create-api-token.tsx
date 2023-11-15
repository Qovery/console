import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateApiToken() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createApiToken, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.apiTokens({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your Api token has been created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateApiToken
