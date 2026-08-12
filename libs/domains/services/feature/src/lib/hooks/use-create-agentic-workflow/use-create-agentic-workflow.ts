import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateAgenticWorkflow({ environmentId }: { environmentId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.createAgenticWorkflow, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.services.list(environmentId).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your agent has been created',
      },
      notifyOnError: true,
    },
  })
}
