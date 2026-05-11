import { type Cluster } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import { Badge, Icon } from '@qovery/shared/ui'
import { ClusterType } from '../cluster-type/cluster-type'
import { hasGpuInstance } from '../utils/has-gpu-instance'

export interface ClusterBadgesProps {
  cluster: Cluster
  size?: 'base' | 'sm'
}

export function ClusterBadges({ cluster, size = 'base' }: ClusterBadgesProps) {
  if (cluster.kubernetes === 'SELF_MANAGED') {
    return (
      <>
        <Badge color="neutral" size={size}>
          <Icon name={IconEnum.KUBERNETES} height={16} width={16} className="mr-1" />
          Self managed
        </Badge>
        {cluster.cloud_provider !== 'ON_PREMISE' && (
          <Badge color="neutral" variant="surface" size={size}>
            {cluster.region}
          </Badge>
        )}
      </>
    )
  }

  return (
    <>
      <Badge color="neutral" size={size}>
        <Icon name={IconEnum.QOVERY} height={16} width={16} className="mr-1" />
        Qovery managed
      </Badge>
      <ClusterType
        cloudProvider={cluster.cloud_provider}
        kubernetes={cluster.kubernetes}
        instanceType={cluster.instance_type}
        size={size}
      />
      {cluster.cloud_provider !== 'ON_PREMISE' && (
        <Badge color="neutral" variant="surface" size={size}>
          {cluster.region}
        </Badge>
      )}
      {cluster.kubernetes !== 'PARTIALLY_MANAGED' && cluster.version && (
        <Badge color="neutral" variant="surface" size={size}>
          {cluster.version}
        </Badge>
      )}
      {hasGpuInstance(cluster) && (
        <Badge color="neutral" variant="surface" size={size}>
          GPU pool
        </Badge>
      )}
    </>
  )
}

export default ClusterBadges
