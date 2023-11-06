import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseCreateApiTokenProps {
  organizationId: string
}

export function useCreateApiToken({ organizationId }: UseCreateApiTokenProps) {
  const queryClient = useQueryClient()

  return useMutation(mutations.createApiToken, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.apiTokens({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your Api token is being created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateApiToken
