import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterRoutingTableProps {
  organizationId: string
  clusterId: string
}

export function useClusterRoutingTable({ organizationId, clusterId }: UseClusterRoutingTableProps) {
  return useQuery({
    ...queries.clusters.routingTable({ organizationId, clusterId }),
  })
}

export default useClusterRoutingTable
