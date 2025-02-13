import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'

export function useUpdateKarpenterPrivateFargate() {
  const queryClient = useQueryClient()

  return useMutation(mutations.updateKarpenterPrivateFargate, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.clusters.list({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useUpdateKarpenterPrivateFargate
