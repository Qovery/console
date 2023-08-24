import { StateEnum } from 'qovery-typescript-axios'
import { ClusterButtonsActions } from '@qovery/shared/console-shared'
import { type ClusterEntity } from '@qovery/shared/interfaces'
import { Icon, Skeleton, StatusChip, Tag, TagClusterType } from '@qovery/shared/ui'
import { getStatusClusterMessage } from '@qovery/shared/utils'

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
      <div className="flex">
        {cluster.production && (
          <Tag dataTestId="tag-prod" className="text-brand-500 border border-brand-500 bg-brand-50 truncate mr-2">
            PROD
          </Tag>
        )}
        {cluster.is_default && (
          <Tag dataTestId="tag-default" className="text-sky-500 border border-sky-500 bg-sky-50 truncate mr-2">
            DEFAULT
          </Tag>
        )}
        <TagClusterType
          className="text-neutral-350 border-neutral-250 mr-2"
          cloudProvider={cluster?.cloud_provider}
          kubernetes={cluster?.kubernetes}
        />
        <Tag dataTestId="tag-region" className="text-neutral-350 border border-neutral-250 truncate mr-2">
          {cluster.region}
        </Tag>
        <Tag dataTestId="tag-version" className="text-neutral-350 border border-neutral-250 truncate mr-2">
          {cluster.version}
        </Tag>
        <Tag dataTestId="tag-instance" className="text-neutral-350 border border-neutral-250 truncate">
          {cluster.instance_type?.replace('_', '.').toLowerCase()}
        </Tag>
      </div>
    </div>
  )
}

export default CardCluster
