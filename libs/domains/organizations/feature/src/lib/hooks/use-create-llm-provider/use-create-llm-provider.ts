import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type LlmProviderResponse } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateLlmProvider() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createLlmProvider, {
    onSuccess(createdLlmProvider, { organizationId }) {
      const queryKey = queries.organizations.llmProviders({ organizationId }).queryKey
      queryClient.setQueryData<LlmProviderResponse[]>(queryKey, (llmProviders = []) => [
        ...llmProviders,
        createdLlmProvider,
      ])
      queryClient.invalidateQueries({ queryKey })
    },
    meta: {
      notifyOnSuccess: { title: 'Your token has been created' },
      notifyOnError: true,
    },
  })
}
