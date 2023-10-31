import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteGitToken({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteGitToken, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.gitTokens({ organizationId }).queryKey,
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

export default useDeleteGitToken
