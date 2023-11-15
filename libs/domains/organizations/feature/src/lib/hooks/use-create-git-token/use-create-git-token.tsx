import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateGitToken() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createGitToken, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.gitTokens({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your Git token has been created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateGitToken
