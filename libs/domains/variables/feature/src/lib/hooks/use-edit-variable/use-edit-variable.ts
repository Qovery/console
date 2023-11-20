import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/variables/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditVariable() {
  const queryClient = useQueryClient()
  return useMutation(mutations.editVariable, {
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

export default useEditVariable
