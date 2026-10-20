import { useQuery } from '@tanstack/react-query'
import { ClusterStateEnum } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export function useDemoClusterInstallation({ organizationId }: { organizationId: string }) {
  const query = useQuery({
    ...queries.clusters.list({ organizationId }),
    enabled: Boolean(organizationId),
    refetchInterval: 5000,
  })
  // READY means not installed yet; only a deployed demo can complete onboarding.
  const readyCluster = query.data?.find((cluster) => cluster.is_demo && cluster.status === ClusterStateEnum.DEPLOYED)
  return { readyCluster, isError: query.isError }
}
