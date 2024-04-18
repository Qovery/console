import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useAddAnnotationsGroup() {
  const queryClient = useQueryClient()

  return useMutation(mutations.addAnnotationsGroup, {
    onSuccess(_, { serviceId, serviceType }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.annotationsGroup({ serviceId, serviceType }).queryKey,
      })
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useAddAnnotationsGroup
