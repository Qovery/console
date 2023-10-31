import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseCreateGitTokenProps {
  organizationId: string
}

export function useCreateGitToken({ organizationId }: UseCreateGitTokenProps) {
  const queryClient = useQueryClient()

  return useMutation(mutations.createGitToken, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.gitTokens({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your Git token is being created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateGitToken
