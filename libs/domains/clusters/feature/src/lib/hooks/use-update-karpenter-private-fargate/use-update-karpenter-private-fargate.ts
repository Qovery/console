import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'

export function useUpdateKarpenterPrivateFargate() {
  return useMutation(mutations.updateKarpenterPrivateFargate, {
    meta: {
      notifyOnError: true,
    },
  })
}

export default useUpdateKarpenterPrivateFargate
