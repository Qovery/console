import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'

export function useStopCluster() {
  const queryClient = useQueryClient()

  return useMutation(mutations.stopCluster, {
    onSuccess(_, { organizationId, clusterId }) {
      queryClient.invalidateQueries({
        queryKey: queries.clusters.listStatuses({ organizationId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.clusters.status({ organizationId, clusterId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your cluster is being stopped',
      },
      notifyOnError: true,
    },
  })
}

export default useStopCluster
