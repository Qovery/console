import { type PropsWithChildren } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { ClusterType } from '@qovery/domains/clusters/feature'
import { ClusterButtonsActions } from '@qovery/shared/console-shared'
import { type ClusterEntity } from '@qovery/shared/interfaces'
import { CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { Badge, Header, Icon, IconAwesomeEnum, Skeleton, Tabs } from '@qovery/shared/ui'

export interface ContainerProps {
  cluster?: ClusterEntity
}

export function Container(props: PropsWithChildren<ContainerProps>) {
  const { children, cluster } = props
  const { organizationId = '', clusterId = '' } = useParams()
  const { pathname } = useLocation()

  const statusLoading = !!cluster?.extendedStatus?.status?.status

  const headerActions = (
    <>
      <Skeleton width={150} height={32} show={!statusLoading}>
        {cluster ? (
          <>
            <ClusterButtonsActions cluster={cluster} noSettings />
            <span className="ml-4 mr-1 mt-2 h-4 w-[1px] bg-neutral-200"></span>
          </>
        ) : (
          <div />
        )}
      </Skeleton>
      {cluster?.production && (
        <Badge size="sm" color="neutral">
          PROD
        </Badge>
      )}
      {cluster?.is_default && (
        <Badge size="sm" color="sky">
          DEFAULT
        </Badge>
      )}
      {cluster ? (
        <ClusterType size="sm" cloudProvider={cluster.cloud_provider} kubernetes={cluster.kubernetes} />
      ) : (
        <Skeleton width={120} height={32} show />
      )}
      <Skeleton width={120} height={32} show={!cluster}>
        <Badge size="sm" color="neutral">
          {cluster?.region}
        </Badge>
      </Skeleton>
      <Skeleton width={120} height={32} show={!cluster}>
        <Badge size="sm" color="neutral">
          {cluster?.version}
        </Badge>
      </Skeleton>
      <Skeleton width={120} height={32} show={!cluster}>
        <Badge size="sm" color="neutral">
          {cluster?.instance_type?.toLowerCase().replace('_', '.')}
        </Badge>
      </Skeleton>
    </>
  )

  const tabsItems = [
    {
      icon: <Icon name={IconAwesomeEnum.WHEEL} className="w-4 mt-0.5" />,
      name: 'Settings',
      active: pathname.includes(CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL),
      link: `${CLUSTER_URL(organizationId, clusterId)}${CLUSTER_SETTINGS_URL}`,
    },
  ]

  return (
    <>
      <Header title={cluster?.name} icon={cluster?.cloud_provider} iconClassName="w-10 mr-3" actions={headerActions} />
      <Tabs items={tabsItems} />
      <div className="flex-grow flex-col flex">{children}</div>
    </>
  )
}

export default Container
