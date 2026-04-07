import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useEnvironmentsByCluster({ organizationId, clusterId }: { organizationId: string; clusterId: string }) {
  return useQuery({
    ...queries.clusters.environmentsByClusterId({ organizationId, clusterId }),
  })
}

export default useEnvironmentsByCluster
