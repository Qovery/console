import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteLlmProvider() {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteLlmProvider, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({ queryKey: queries.organizations.llmProviders({ organizationId }).queryKey })
    },
    meta: {
      notifyOnSuccess: { title: 'Your token has been deleted' },
      notifyOnError: true,
    },
  })
}
