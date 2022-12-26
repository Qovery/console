import { StateEnum } from 'qovery-typescript-axios'
import { ClusterButtonsActions } from '@qovery/shared/console-shared'
import { ClusterEntity } from '@qovery/shared/interfaces'
import { Icon, Skeleton, StatusChip, Tag } from '@qovery/shared/ui'
import { getStatusClusterMessage } from '@qovery/shared/utils'

export interface CardClusterProps {
  cluster: ClusterEntity
}

export const getColorForStatus = (status?: StateEnum): string => {
  switch (status) {
    case StateEnum.DEPLOYMENT_QUEUED:
    case StateEnum.DEPLOYING:
    case StateEnum.RUNNING:
    case StateEnum.STOP_QUEUED:
    case StateEnum.STOPPING:
    case StateEnum.DELETE_QUEUED:
    case StateEnum.DELETING:
      return 'text-progressing-500'
    case StateEnum.STOP_ERROR:
    case StateEnum.DELETE_ERROR:
    case StateEnum.DEPLOYMENT_ERROR:
      return 'text-error-500'
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
    <div data-testid={`cluster-list-${cluster.id}`} className="border border-element-light-lighter-400 rounded p-5">
      <div className="flex justify-between mb-5">
        <div className="flex items-center">
          <Icon className="mr-3" name={cluster.cloud_provider} />
          <div className="flex flex-col">
            <div className="flex">
              <h2 className="flex items-center text-xs text-text-600 font-medium">
                <span className="block mr-2">{cluster.name}</span>
                <StatusChip status={cluster.extendedStatus?.status?.status} />
              </h2>
            </div>
            <Skeleton height={12} width={100} show={!statusLoading}>
              <p
                data-testid="status-message"
                className={`text-xxs mt-0.5 font-medium ${getColorForStatus(cluster.extendedStatus?.status?.status)}`}
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
      <div className="flex">
        {cluster.production && (
          <Tag dataTestId="tag-prod" className="text-brand-500 border border-brand-500 bg-brand-50 truncate mr-2">
            PROD
          </Tag>
        )}
        {cluster.is_default && (
          <Tag
            dataTestId="tag-default"
            className="text-accent2-500 border border-accent2-500 bg-accent2-50 truncate mr-2"
          >
            DEFAULT
          </Tag>
        )}
        <Tag dataTestId="tag-region" className="text-text-400 border border-element-light-lighter-500 truncate mr-2">
          {cluster.region}
        </Tag>
        <Tag dataTestId="tag-version" className="text-text-400 border border-element-light-lighter-500 truncate mr-2">
          {cluster.version}
        </Tag>
        <Tag dataTestId="tag-instance" className="text-text-400 border border-element-light-lighter-500 truncate">
          {cluster.instance_type}
        </Tag>
      </div>
    </div>
  )
}

export default CardCluster
