import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type ClusterAdvancedSettings } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'

/**
 * Sets the `cluster.zones_count` advanced setting on a cluster that was just created, before its first deployment.
 * The cluster request has no advanced settings, so this reads the stored settings and writes them back with the new
 * value. No toast: it runs inside the creation flow.
 */
export function useSetClusterZonesCount() {
  const queryClient = useQueryClient()

  return useMutation(
    async ({
      organizationId,
      clusterId,
      zonesCount,
    }: {
      organizationId: string
      clusterId: string
      zonesCount: number
    }) => {
      const advancedSettings = await queryClient.fetchQuery(
        queries.clusters.advancedSettings({ organizationId, clusterId })
      )
      return mutations.editAdvancedSettings({
        organizationId,
        clusterId,
        // `cluster.zones_count` is not in the generated client yet (qovery-openapi-spec #1268)
        clusterAdvancedSettings: { ...advancedSettings, 'cluster.zones_count': zonesCount } as ClusterAdvancedSettings,
      })
    },
    {
      onSuccess(_, { organizationId, clusterId }) {
        queryClient.invalidateQueries({
          queryKey: queries.clusters.advancedSettings({ organizationId, clusterId }).queryKey,
        })
      },
      meta: { notifyOnError: true },
    }
  )
}

export default useSetClusterZonesCount
