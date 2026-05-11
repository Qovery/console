import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'

export function useEksAnywhereClusterJwt() {
  return useMutation(mutations.eksAnywhereClusterJwt, {
    meta: {
      notifyOnError: true,
    },
  })
}

export default useEksAnywhereClusterJwt
