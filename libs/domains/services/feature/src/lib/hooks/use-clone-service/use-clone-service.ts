import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCloneService() {
  const queryClient = useQueryClient()
  return useMutation(mutations.cloneService, {
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: queries.services.list(result.environment.id).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your service is cloned',
      },
      notifyOnError: true,
    },
  })
}

export default useCloneService
