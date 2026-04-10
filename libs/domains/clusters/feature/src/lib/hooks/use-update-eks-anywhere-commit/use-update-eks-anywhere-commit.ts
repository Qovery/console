import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'
import { useDeployCluster } from '../use-deploy-cluster/use-deploy-cluster'

export function useUpdateEksAnywhereCommit() {
  const queryClient = useQueryClient()
  const { mutateAsync: deployCluster } = useDeployCluster()

  return useMutation(mutations.updateEksAnywhereCommit, {
    onSuccess(_, { organizationId, clusterId }) {
      queryClient.invalidateQueries({
        queryKey: queries.clusters.list({ organizationId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.clusters.status({ organizationId, clusterId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.clusters.eksAnywhereCommits({ organizationId, clusterId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess(_: unknown, variables: unknown) {
        const { organizationId, clusterId } = variables as Parameters<typeof mutations.updateEksAnywhereCommit>[0]
        return {
          title: 'Cluster updated',
          description: 'You must update to apply the settings',
          callback() {
            deployCluster({ organizationId, clusterId })
          },
          labelAction: 'Update',
        }
      },
      notifyOnError: true,
    },
  })
}

export default useUpdateEksAnywhereCommit
