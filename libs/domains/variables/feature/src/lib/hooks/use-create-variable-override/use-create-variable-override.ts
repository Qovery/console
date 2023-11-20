import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/variables/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateVariableOverride() {
  const queryClient = useQueryClient()
  return useMutation(mutations.createVariableOverride, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.variables.list._def,
      })
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useCreateVariableOverride
