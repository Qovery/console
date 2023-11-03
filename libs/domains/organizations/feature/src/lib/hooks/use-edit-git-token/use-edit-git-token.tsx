import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseEditGitTokenProps {
  organizationId: string
}

export function useEditGitToken({ organizationId }: UseEditGitTokenProps) {
  const queryClient = useQueryClient()

  return useMutation(mutations.editGitToken, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.gitTokens({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your Git token is being edited',
      },
      notifyOnError: true,
    },
  })
}

export default useEditGitToken
