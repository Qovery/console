import { Link } from '@tanstack/react-router'
import type { Cluster, ClusterStatus } from 'qovery-typescript-axios'
import { Icon } from '@qovery/shared/ui'
import { ClusterRunningStatusIndicator } from '../cluster-running-status-indicator/cluster-running-status-indicator'
import { useClusterRunningStatusSocket } from '../hooks/use-cluster-running-status-socket/use-cluster-running-status-socket'

export function ClusterProductionCard({ cluster, clusterStatus }: { cluster: Cluster; clusterStatus?: ClusterStatus }) {
  useClusterRunningStatusSocket({ organizationId: cluster.organization.id, clusterId: cluster.id })

  return (
    <Link
      to="/organization/$organizationId/cluster/$clusterId/overview"
      params={{ organizationId: cluster.organization.id, clusterId: cluster.id }}
      className="duration-50 flex flex-col gap-5 rounded border border-neutral bg-surface-neutral p-5 text-neutral transition-colors hover:bg-surface-neutral-subtle"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral bg-surface-neutral-subtle">
          <Icon name={cluster.cloud_provider} height="65%" width="65%" />
        </div>
        <div>
          <p className="flex items-center gap-1.5 font-medium">
            {cluster.name}
            <span className="mt-[1px]">
              <ClusterRunningStatusIndicator
                type="dot"
                cluster={cluster}
                clusterDeploymentStatus={clusterStatus?.status}
              />
            </span>
          </p>
          <span className="text-ssm text-neutral-subtle">No services created yet</span>
        </div>
      </div>
    </Link>
  )
}
