import { StateEnum } from 'qovery-typescript-axios'
import { ClusterType } from '@qovery/domains/clusters/feature'
import { ClusterButtonsActions } from '@qovery/shared/console-shared'
import { type ClusterEntity } from '@qovery/shared/interfaces'
import { Badge, Icon, Skeleton, StatusChip } from '@qovery/shared/ui'
import { getStatusClusterMessage } from '@qovery/shared/util-js'

export interface CardClusterProps {
  cluster: ClusterEntity
}

export const getColorForStatus = (status?: StateEnum): string => {
  switch (status) {
    case StateEnum.DEPLOYMENT_QUEUED:
    case StateEnum.DEPLOYING:
    case StateEnum.DEPLOYED:
    case StateEnum.STOP_QUEUED:
    case StateEnum.STOPPING:
    case StateEnum.DELETE_QUEUED:
    case StateEnum.DELETING:
      return 'text-orange-500'
    case StateEnum.STOP_ERROR:
    case StateEnum.DELETE_ERROR:
    case StateEnum.DEPLOYMENT_ERROR:
    case StateEnum.BUILD_ERROR:
      return 'text-red-500'
    case StateEnum.READY:
    case StateEnum.DELETED:
    case StateEnum.STOPPED:
    default:
      return 'text-brand-500'
  }
}

export function CardCluster(props: CardClusterProps) {
  const { cluster } = props

  const statusLoading = !!cluster.extendedStatus?.status?.status

  return (
    <div data-testid={`cluster-list-${cluster.id}`} className="border border-neutral-200 rounded p-5">
      <div className="flex justify-between mb-5">
        <div className="flex items-center">
          <Icon className="mr-3" name={cluster.cloud_provider} />
          <div className="flex flex-col">
            <div className="flex">
              <h2 className="flex items-center text-xs text-neutral-400 font-medium">
                <span className="block mr-2">{cluster.name}</span>
                <StatusChip status={cluster.extendedStatus?.status?.status} />
              </h2>
            </div>
            <Skeleton height={12} width={100} show={!statusLoading}>
              <p
                data-testid="status-message"
                className={`text-2xs mt-0.5 font-medium ${getColorForStatus(cluster.extendedStatus?.status?.status)}`}
              >
                {getStatusClusterMessage(
                  cluster.extendedStatus?.status?.status,
                  cluster.extendedStatus?.status?.is_deployed
                )}
              </p>
            </Skeleton>
          </div>
        </div>
        <Skeleton height={32} width={146} show={!statusLoading}>
          <ClusterButtonsActions cluster={cluster} />
        </Skeleton>
      </div>
      <div className="flex flex-wrap gap-2">
        {cluster.production && (
          <Badge size="xs" color="brand" data-testid="tag-prod">
            PROD
          </Badge>
        )}
        {cluster.is_default && (
          <Badge size="xs" color="sky" variant="surface" data-testid="tag-default">
            DEFAULT
          </Badge>
        )}
        <ClusterType cloudProvider={cluster.cloud_provider} kubernetes={cluster.kubernetes} />
        <Badge size="xs" color="neutral" data-testid="tag-region">
          {cluster.region}
        </Badge>
        <Badge size="xs" color="neutral" data-testid="tag-version">
          {cluster.version}
        </Badge>
        <Badge size="xs" color="neutral" data-testid="tag-instance">
          {cluster.instance_type?.replace('_', '.').toLowerCase()}
        </Badge>
      </div>
    </div>
  )
}

export default CardCluster
