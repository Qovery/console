import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'

export function useUpdateClusterOperator() {
  const queryClient = useQueryClient()

  return useMutation(mutations.updateClusterOperator, {
    onSuccess(_, { organizationId, clusterId }) {
      queryClient.invalidateQueries({
        queryKey: queries.clusters.operatorStatus({ organizationId, clusterId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Operator update started',
      },
      notifyOnError: true,
    },
  })
}

export default useUpdateClusterOperator
