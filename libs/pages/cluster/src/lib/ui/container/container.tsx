import { ClusterDeploymentStatusEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import {
  ClusterActionToolbar,
  ClusterAvatar,
  ClusterType,
  useCluster,
  useClusterStatus,
  useDeployCluster,
} from '@qovery/domains/clusters/feature'
import { IconEnum } from '@qovery/shared/enums'
import { CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { Badge, ErrorBoundary, Header, Icon, Section, Skeleton, Tabs } from '@qovery/shared/ui'
import NeedRedeployFlag from '../need-redeploy-flag/need-redeploy-flag'

export function Container({ children }: PropsWithChildren) {
  const { organizationId = '', clusterId = '' } = useParams()
  const { pathname } = useLocation()

  const { data: cluster } = useCluster({ organizationId, clusterId })
  const { mutate: deployCluster } = useDeployCluster()
  const { data: clusterStatus, isLoading } = useClusterStatus({ organizationId, clusterId })

  const headerActions = (
    <div className="flex flex-row items-center gap-4">
      <Skeleton width={150} height={36} show={isLoading}>
        {cluster && clusterStatus ? (
          <ClusterActionToolbar cluster={cluster} clusterStatus={clusterStatus} noSettings />
        ) : (
          <div />
        )}
      </Skeleton>
      <div className="h-4 w-px bg-neutral-250" />
      <div className="flex flex-row items-center gap-2">
        {cluster?.production && <Badge color="neutral">Production</Badge>}
        {cluster?.is_default && <Badge color="sky">Default</Badge>}
        {cluster ? (
          cluster.kubernetes === 'SELF_MANAGED' ? (
            <Badge color="neutral">
              <Icon name={IconEnum.KUBERNETES} height={16} width={16} className="mr-1" />
              Self managed
            </Badge>
          ) : (
            <>
              <Badge color="neutral">
                <Icon name={IconEnum.QOVERY} height={16} width={16} className="mr-1" />
                Qovery managed
              </Badge>
              <ClusterType cloudProvider={cluster.cloud_provider} kubernetes={cluster.kubernetes} />
            </>
          )
        ) : (
          <Skeleton width={120} height={22} show />
        )}
        <Skeleton width={120} height={22} show={!cluster}>
          <Badge color="neutral">{cluster?.region}</Badge>
        </Skeleton>
        {cluster?.kubernetes !== 'SELF_MANAGED' && (
          <>
            <Skeleton width={120} height={22} show={!cluster}>
              {cluster?.version && <Badge color="neutral">{cluster?.version}</Badge>}
            </Skeleton>
            <Skeleton width={120} height={22} show={!cluster}>
              {cluster?.instance_type && (
                <Badge color="neutral">{cluster?.instance_type?.toLowerCase().replace('_', '.')}</Badge>
              )}
            </Skeleton>
          </>
        )}
      </div>
    </div>
  )

  const tabsItems = [
    {
      icon: <Icon iconName="gear" className="mt-0.5 w-4" />,
      name: 'Settings',
      active: pathname.includes(CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL),
      link: `${CLUSTER_URL(organizationId, clusterId)}${CLUSTER_SETTINGS_URL}`,
    },
  ]

  return (
    <ErrorBoundary>
      <Section className="flex-1">
        <Header title={cluster?.name} actions={headerActions}>
          {cluster && <ClusterAvatar cluster={cluster} />}
        </Header>
        <Tabs items={tabsItems} />
        {cluster && cluster.deployment_status !== ClusterDeploymentStatusEnum.UP_TO_DATE && (
          <NeedRedeployFlag
            deploymentStatus={cluster?.deployment_status}
            onClickButton={() =>
              deployCluster({
                organizationId,
                clusterId,
              })
            }
          />
        )}
        <div className="mt-2 flex min-h-0 flex-grow flex-col items-stretch rounded-b-none rounded-t-sm bg-white">
          {children}
        </div>
      </Section>
    </ErrorBoundary>
  )
}

export default Container
