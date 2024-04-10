import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'

export function useAddAnnotationsGroup() {
  return useMutation(mutations.addAnnotationsGroup, {
    meta: {
      notifyOnError: true,
    },
  })
}

export default useAddAnnotationsGroup
