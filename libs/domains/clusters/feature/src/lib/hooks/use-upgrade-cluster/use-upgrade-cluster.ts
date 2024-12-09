import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseUpgradeClusterProps {
  organizationId: string
}

export function useUpgradeCluster({ organizationId }: UseUpgradeClusterProps) {
  const queryClient = useQueryClient()

  return useMutation(mutations.upgradeCluster, {
    onSuccess(_, { clusterId }) {
      queryClient.invalidateQueries({
        queryKey: queries.clusters.status({ organizationId, clusterId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.clusters.listStatuses({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your cluster is being upgraded',
      },
      notifyOnError: true,
    },
  })
}

export default useUpgradeCluster
