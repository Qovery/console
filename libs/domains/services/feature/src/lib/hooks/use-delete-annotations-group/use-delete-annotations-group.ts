import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'

export function useDeleteAnnotationsGroup() {
  return useMutation(mutations.deleteAnnotationsGroup, {
    meta: {
      notifyOnError: true,
    },
  })
}

export default useDeleteAnnotationsGroup
