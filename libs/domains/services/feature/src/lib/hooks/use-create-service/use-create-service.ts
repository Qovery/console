import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateService() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createService, {
    onSuccess(response) {
      queryClient.invalidateQueries({
        queryKey: queries.services.list(response.environment.id).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: `Your database has been created`,
      },
      notifyOnError: true,
    },
  })
}

export default useCreateService
