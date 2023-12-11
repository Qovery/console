import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteService({ environmentId }: { environmentId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteService, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.services.list(environmentId).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.listStatuses(environmentId).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your service is being deleted',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteService
