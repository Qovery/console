import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'

export function useTerraformEditVariables() {
  return useMutation(mutations.replaceAllTerraformVariables, {
    meta: {
      notifyOnSuccess: false,
      notifyOnError: false,
    },
  })
}
