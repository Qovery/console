import { type Cluster } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { Badge } from '@qovery/shared/ui'
import { useClusterRunningStatus } from '../hooks/use-cluster-running-status/use-cluster-running-status'

export interface ClusterRunningStatusBadgeProps {
  cluster: Cluster
}

export function ClusterRunningStatusBadge({ cluster }: ClusterRunningStatusBadgeProps) {
  const { data: status } = useClusterRunningStatus({
    organizationId: cluster.organization.id,
    clusterId: cluster.id,
  })

  return match(status?.computed_status)
    .with({ global_status: 'RUNNING' }, (status) => (
      <Badge variant="surface" color="green" className="items-center gap-2 border-[#44C9794D] pr-2 capitalize">
        <span className="text-neutral-400">{status.global_status.toLowerCase()}</span>
        <span className="block h-2 w-2 rounded-full bg-current" />
      </Badge>
    ))
    .with({ global_status: 'WARNING' }, (status) => (
      <Badge variant="surface" color="yellow" className="items-center gap-1.5 border-[#D1A0024D] pr-2 capitalize">
        <span className="flex h-4 w-4 items-center justify-center bg-yellow-700 text-white">
          {Object.keys(status.node_warnings).length}
        </span>
        <span className="text-neutral-400">{status.global_status.toLowerCase()}</span>
      </Badge>
    ))
    .with({ global_status: 'ERROR' }, (status) => (
      <Badge variant="surface" color="red" className="items-center gap-2 border-[#FF62404D] pr-2 capitalize">
        <span className="text-neutral-400">{status.global_status.toLowerCase()}</span>
        <span className="block h-2 w-2 rounded-full bg-current" />
      </Badge>
    ))
    .otherwise(() => (
      <Badge variant="surface" color="red" className="items-center gap-2 border-[#FF62404D] pr-2">
        <span className="text-neutral-400">Status unavailable</span>
        <span className="block h-2 w-2 rounded-full bg-current" />
      </Badge>
    ))
}

export default ClusterRunningStatusBadge
