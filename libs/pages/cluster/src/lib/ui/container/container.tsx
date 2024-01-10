import { type Cluster, ClusterDeploymentStatusEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { ClusterActionToolbar, ClusterType, useClusterStatus } from '@qovery/domains/clusters/feature'
import { CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { Badge, Header, Icon, IconAwesomeEnum, Section, Skeleton, Tabs } from '@qovery/shared/ui'
import NeedRedeployFlag from '../need-redeploy-flag/need-redeploy-flag'

export interface ContainerProps {
  cluster?: Cluster
  deployCluster: () => void
}

export function Container({ children, cluster, deployCluster }: PropsWithChildren<ContainerProps>) {
  const { organizationId = '', clusterId = '' } = useParams()
  const { pathname } = useLocation()

  const { data: clusterStatus, isLoading } = useClusterStatus({ organizationId, clusterId })

  const headerActions = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-2">
        {cluster?.production && (
          <Badge size="xs" color="neutral">
            Production
          </Badge>
        )}
        {cluster?.is_default && (
          <Badge size="xs" color="sky">
            Default
          </Badge>
        )}
        {cluster ? (
          <ClusterType size="xs" cloudProvider={cluster.cloud_provider} kubernetes={cluster.kubernetes} />
        ) : (
          <Skeleton width={120} height={22} show />
        )}
        <Skeleton width={120} height={22} show={!cluster}>
          <Badge size="xs" color="neutral">
            {cluster?.region}
          </Badge>
        </Skeleton>
        <Skeleton width={120} height={22} show={!cluster}>
          <Badge size="xs" color="neutral">
            {cluster?.version}
          </Badge>
        </Skeleton>
        <Skeleton width={120} height={22} show={!cluster}>
          <Badge size="xs" color="neutral">
            {cluster?.instance_type?.toLowerCase().replace('_', '.')}
          </Badge>
        </Skeleton>
      </div>
      <Skeleton width={150} height={32} show={isLoading}>
        {cluster && clusterStatus ? (
          <ClusterActionToolbar
            cluster={cluster}
            clusterStatus={clusterStatus}
            organizationId={organizationId}
            noSettings
          />
        ) : (
          <div />
        )}
      </Skeleton>
    </div>
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
    <Section className="flex-1">
      <Header title={cluster?.name} icon={cluster?.cloud_provider} actions={headerActions} />
      <Tabs items={tabsItems} />
      {cluster && cluster.deployment_status !== ClusterDeploymentStatusEnum.UP_TO_DATE && (
        <NeedRedeployFlag deploymentStatus={cluster?.deployment_status} onClickButton={deployCluster} />
      )}
      <div className="flex-grow flex-col flex">{children}</div>
    </Section>
  )
}

export default Container
