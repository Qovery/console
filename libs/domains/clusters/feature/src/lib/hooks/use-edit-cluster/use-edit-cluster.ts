import { useMutation, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { type Cluster } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'
import { useDeployCluster } from '../use-deploy-cluster/use-deploy-cluster'

export function useEditCluster({ silently = false, showClusterUpdateAction = true } = {}) {
  const queryClient = useQueryClient()
  const { mutateAsync: deployCluster } = useDeployCluster()

  return useMutation(mutations.editCluster, {
    onSuccess(_, { organizationId, clusterId, clusterRequest }) {
      const clustersQueryKey = queries.clusters.list({ organizationId }).queryKey
      const previousCluster = queryClient
        .getQueryData<Cluster[]>(clustersQueryKey)
        ?.find((cluster) => cluster.id === clusterId)

      queryClient.invalidateQueries({ queryKey: clustersQueryKey })
      queryClient.invalidateQueries({
        queryKey: queries.clusters.kubeconfig({ organizationId, clusterId }).queryKey,
      })
      // Toggling restrictive permissions changes the extended credentials on the backend side (cleared when turned off)
      if (
        previousCluster?.wide_permissions?.using_restrictive_permissions !==
        clusterRequest.wide_permissions?.using_restrictive_permissions
      ) {
        queryClient.invalidateQueries({
          queryKey: queries.clusters.cloudProviderInfo({ organizationId, clusterId }).queryKey,
        })
      }

      if (clusterRequest.keda?.enabled) {
        posthog.capture('cluster-keda-enabled', {
          cloud_provider: clusterRequest.cloud_provider,
        })
      }
    },
    meta: {
      notifyOnSuccess: silently
        ? false
        : (_: unknown, variables: unknown) => {
            if (!showClusterUpdateAction) {
              return { title: 'Cluster updated' }
            }

            const { organizationId, clusterId } = variables as Parameters<typeof mutations.editCluster>[0]
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

export default useEditCluster
