import { type Cluster, type ClusterStatus } from 'qovery-typescript-axios'
import { Link } from 'react-router-dom'
import { match } from 'ts-pattern'
import { IconEnum } from '@qovery/shared/enums'
import { CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { Badge, Icon, Skeleton, StatusChip } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { ClusterActionToolbar } from '../cluster-action-toolbar/cluster-action-toolbar'
import { ClusterType } from '../cluster-type/cluster-type'

export interface ClusterCardProps {
  cluster: Cluster
  clusterStatus?: ClusterStatus
}

export function ClusterCard({ cluster, clusterStatus }: ClusterCardProps) {
  const cloudProviderIcon = match(cluster.cloud_provider)
    .with('ON_PREMISE', () => IconEnum.KUBERNETES)
    .otherwise(() => cluster.cloud_provider)

  return (
    <Link
      to={CLUSTER_URL(cluster.organization.id, cluster.id) + CLUSTER_SETTINGS_URL}
      className="duration-50 flex flex-col gap-5 rounded border border-neutral-200 p-5 shadow-sm outline outline-2 outline-transparent transition-all hover:border-brand-500 hover:-outline-offset-2 hover:outline-brand-500"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Icon width={28} height={28} name={cloudProviderIcon} />
          <span className="line-clamp-2 block text-base font-semibold text-neutral-400">{cluster.name}</span>
        </div>
        <div className="flex min-w-28 items-center justify-end gap-1.5">
          <StatusChip status={clusterStatus?.status} />
          <span className="text-sm font-medium text-neutral-400">
            {upperCaseFirstLetter(clusterStatus?.status?.replace('_', ' '))}
          </span>
        </div>
      </div>
      <Skeleton className="min-w-max" height={36} width={146} show={!clusterStatus}>
        {clusterStatus && (
          <div onClick={(e) => e.preventDefault()}>
            <ClusterActionToolbar cluster={cluster} clusterStatus={clusterStatus} />
          </div>
        )}
      </Skeleton>
      <div className="flex flex-wrap gap-2">
        {cluster.production && <Badge color="brand">Production</Badge>}
        {cluster.is_default && (
          <Badge color="sky" variant="surface">
            Default
          </Badge>
        )}
        {cluster.kubernetes === 'SELF_MANAGED' ? (
          <>
            <Badge color="neutral">
              <Icon name={IconEnum.KUBERNETES} height={16} width={16} className="mr-1" />
              Self managed
            </Badge>
            {cluster.is_demo ? <Badge color="neutral">Demo</Badge> : <Badge color="neutral">{cluster.region}</Badge>}
          </>
        ) : (
          <>
            <Badge color="neutral">
              <Icon name={IconEnum.QOVERY} height={16} width={16} className="mr-1" />
              Qovery managed
            </Badge>
            <ClusterType cloudProvider={cluster.cloud_provider} kubernetes={cluster.kubernetes} />
            <Badge color="neutral">{cluster.region}</Badge>
            {cluster.version && <Badge color="neutral">{cluster.version}</Badge>}
            {cluster.instance_type && (
              <Badge color="neutral">{cluster.instance_type.replace('_', '.').toLowerCase()}</Badge>
            )}
          </>
        )}
      </div>
    </Link>
  )
}

export default ClusterCard
