import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditClusterKubeconfig() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editKubeconfig, {
    onSuccess(_, { organizationId, clusterId }) {
      queryClient.invalidateQueries({
        queryKey: queries.clusters.kubeconfig({ organizationId, clusterId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Cluster kubeconfig updated',
      },
      notifyOnError: true,
    },
  })
}
export default useEditClusterKubeconfig
