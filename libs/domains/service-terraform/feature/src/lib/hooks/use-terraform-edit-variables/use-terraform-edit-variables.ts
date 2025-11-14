import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'

export function useTerraformEditVariables() {
  return useMutation(mutations.replaceAllTerraformVariables, {
    onSuccess(data) {
      console.log('🚀 ~ onSuccess ~ data:', data)
    },
    onError(error) {
      console.error('🚀 ~ onError ~ error:', error)
    },
    meta: {
      notifyOnSuccess: false,
      notifyOnError: false,
    },
  })
}
