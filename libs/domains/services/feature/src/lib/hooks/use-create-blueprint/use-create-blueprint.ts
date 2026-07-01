import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateBlueprint() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createBlueprint, {
    onSuccess(response) {
      queryClient.invalidateQueries({
        queryKey: queries.services.list(response.environment_id).queryKey,
      })
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useCreateBlueprint
