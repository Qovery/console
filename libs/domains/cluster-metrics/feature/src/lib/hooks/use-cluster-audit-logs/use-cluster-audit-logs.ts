import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterAuditLogsProps {
  organizationId: string
  clusterId: string
  toTimestamp: string
}

export function useClusterAuditLogs({ organizationId, clusterId, toTimestamp }: UseClusterAuditLogsProps) {
  return useQuery({
    ...queries.clusterMetrics.auditLogs({ organizationId, clusterId, toTimestamp }),
  })
}

export default useClusterAuditLogs
