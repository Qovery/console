import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/variables/data-access'
import { queries } from '@qovery/state/util-queries'

export function useImportVariables() {
  const queryClient = useQueryClient()
  return useMutation(mutations.importVariables, {
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

export default useImportVariables
