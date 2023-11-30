import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/service-helm/data-access'

export function useCreateHelmDefaultValues() {
  return useMutation(mutations.createHelmDefaultValues, {
    meta: {
      notifyOnError: true,
    },
  })
}

export default useCreateHelmDefaultValues
