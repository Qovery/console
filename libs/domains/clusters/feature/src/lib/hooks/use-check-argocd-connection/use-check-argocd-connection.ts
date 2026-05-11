import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'

export function useCheckArgoCdConnection() {
  return useMutation(mutations.checkArgoCdConnection, {
    meta: {
      notifyOnSuccess: false,
      notifyOnError: false,
    },
  })
}

export default useCheckArgoCdConnection
