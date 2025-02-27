import { type Cluster, type ClusterStatus } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { match } from 'ts-pattern'
import { Badge, Skeleton, Tooltip } from '@qovery/shared/ui'
import { useClusterRunningStatus } from '../hooks/use-cluster-running-status/use-cluster-running-status'

export interface ClusterRunningStatusBadgeProps {
  cluster: Cluster
  clusterDeploymentStatus?: ClusterStatus
}

export function ClusterRunningStatusBadge({ cluster, clusterDeploymentStatus }: ClusterRunningStatusBadgeProps) {
  const [isTimeout, setIsTimeout] = useState(false)

  const { data: status, isLoading } = useClusterRunningStatus({
    organizationId: cluster.organization.id,
    clusterId: cluster.id,
  })

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!status) {
        setIsTimeout(true)
      }
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [status])

  if (isLoading && !isTimeout) {
    return <Skeleton width={80} height={24} />
  }

  if (isTimeout && !status) {
    if (cluster.is_demo) {
      return (
        <Tooltip content="Cannot fetch the cluster status. Check the installation guide">
          <Badge variant="surface" color="neutral" className="items-center gap-2 border-[#A0AFC54D] pr-2">
            <span className="text-neutral-400">Unknown</span>
            <span className="block h-2 w-2 rounded-full bg-neutral-300" />
          </Badge>
        </Tooltip>
      )
    } else {
      return (
        <Tooltip content="Cannot fetch the cluster status. Please contact us if the issue persists">
          <Badge variant="surface" color="red" className="items-center gap-2 border-[#FF62404D] pr-2">
            <span className="truncate text-neutral-400">Status unavailable</span>
            <span className="block h-2 w-2 rounded-full bg-current" />
          </Badge>
        </Tooltip>
      )
    }
  }

  return (
    <Tooltip
      content={<span>Deployment status: {clusterDeploymentStatus?.status}</span>}
      disabled={!clusterDeploymentStatus}
    >
      <span>
        {match(status?.computed_status)
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
              <span className="truncate text-neutral-400">Status unavailable</span>
              <span className="block h-2 w-2 rounded-full bg-current" />
            </Badge>
          ))}
      </span>
    </Tooltip>
  )
}

export default ClusterRunningStatusBadge
