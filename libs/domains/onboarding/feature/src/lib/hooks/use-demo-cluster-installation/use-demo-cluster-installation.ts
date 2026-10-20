import { useQuery, useQueryClient } from '@tanstack/react-query'
import { type Cluster, ClusterStateEnum, type ClusterStatus } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

function findReadyDemoCluster(clusters: Cluster[] = [], statuses: ClusterStatus[] = []) {
  return clusters.find(
    (cluster) =>
      cluster.is_demo &&
      cluster.status === ClusterStateEnum.DEPLOYED &&
      statuses.some(
        (status) =>
          status.cluster_id === cluster.id && status.status === ClusterStateEnum.DEPLOYED && status.is_deployed
      )
  )
}

export function useDemoClusterInstallation({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient()
  const clusterOptions = queries.clusters.list({ organizationId })
  const statuses = useQuery({
    ...queries.clusters.listStatuses({ organizationId }),
    enabled: Boolean(organizationId),
    refetchInterval: (data) =>
      findReadyDemoCluster(queryClient.getQueryData(clusterOptions.queryKey), data) ? false : 5000,
  })
  const clusters = useQuery({
    ...clusterOptions,
    enabled: Boolean(organizationId),
    refetchInterval: (data) => (findReadyDemoCluster(data, statuses.data) ? false : 5000),
  })
  const readyCluster = findReadyDemoCluster(clusters.data, statuses.data)
  return { readyCluster, isError: clusters.isError || statuses.isError }
}
