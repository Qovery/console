import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseServicesClusterProps {
  organizationId: string
  clusterId: string
}

export function useServicesCluster({ organizationId, clusterId }: UseServicesClusterProps) {
  return useQuery({
    ...queries.clusters.listServices({ organizationId, clusterId }),
  })
}

export default useServicesCluster
