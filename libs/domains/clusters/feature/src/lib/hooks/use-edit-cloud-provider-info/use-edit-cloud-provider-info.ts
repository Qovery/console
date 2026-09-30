import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'
import { useDeployCluster } from '../use-deploy-cluster/use-deploy-cluster'

// `withClusterRedeploy`: the caller redeploys the cluster itself, so the notification doesn't prompt for an update
export function useEditCloudProviderInfo({ silently = false, withClusterRedeploy = false } = {}) {
  const queryClient = useQueryClient()
  const { mutate: deployCluster } = useDeployCluster()

  return useMutation(mutations.editCloudProviderInfo, {
    onSuccess(_, { organizationId, clusterId }) {
      queryClient.invalidateQueries({
        queryKey: queries.clusters.cloudProviderInfo({ organizationId, clusterId }).queryKey,
      })
    },
    ...(silently
      ? {}
      : {
          meta: {
            notifyOnSuccess(_: unknown, variables: unknown) {
              if (withClusterRedeploy) {
                return { title: 'Credentials updated' }
              }

              const { organizationId, clusterId } = variables as Parameters<typeof mutations.editCloudProviderInfo>[0]
              return {
                title: 'Credentials updated',
                description: 'You must update your cluster to apply the settings',
                callback() {
                  deployCluster({ organizationId, clusterId })
                },
                labelAction: 'Update cluster',
              }
            },
            notifyOnError: true,
          },
        }),
  })
}

export default useEditCloudProviderInfo
