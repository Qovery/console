import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clusterOperatorMutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'

interface ClusterOperatorQueryProps {
  organizationId: string
  clusterId: string
  enabled?: boolean
}

export function useClusterOperatorStatus({ organizationId, clusterId, enabled = true }: ClusterOperatorQueryProps) {
  return useQuery({
    ...queries.clusterOperator.status({ organizationId, clusterId }),
    enabled: enabled && Boolean(organizationId) && Boolean(clusterId),
  })
}

export function useClusterOperatorBootstrap({ organizationId, clusterId, enabled = true }: ClusterOperatorQueryProps) {
  return useQuery({
    ...queries.clusterOperator.bootstrap({ organizationId, clusterId }),
    enabled: enabled && Boolean(organizationId) && Boolean(clusterId),
  })
}

export function useAttachClusterOperator() {
  const queryClient = useQueryClient()

  return useMutation(clusterOperatorMutations.attach, {
    onSuccess(_, { organizationId, clusterId }) {
      queryClient.invalidateQueries({
        queryKey: queries.clusterOperator.status({ organizationId, clusterId }).queryKey,
      })
    },
    meta: {
      notifyOnError: true,
    },
  })
}
