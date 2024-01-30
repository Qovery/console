import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteApiToken() {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteApiToken, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.apiTokens({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your Api token is being deleted',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteApiToken
