import { useQueryClient } from '@tanstack/react-query'
import { DatabaseModeEnum, type Environment, ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import { postDatabaseActionsDeploy, postDatabaseActionsRedeploy } from '@qovery/domains/database'
import { EnvironmentMode } from '@qovery/domains/environments/feature'
import { selectClusterById } from '@qovery/domains/organization'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ServiceStateChip, useDeploymentStatus } from '@qovery/domains/services/feature'
import { DatabaseButtonsActions, NeedRedeployFlag } from '@qovery/shared/console-shared'
import { IconEnum } from '@qovery/shared/enums'
import { type ClusterEntity, type DatabaseEntity } from '@qovery/shared/interfaces'
import {
  DATABASE_DEPLOYMENTS_URL,
  DATABASE_GENERAL_URL,
  DATABASE_SETTINGS_URL,
  DATABASE_URL,
} from '@qovery/shared/routes'
import { Badge, Header, Icon, Section, Skeleton, Tabs, Tooltip } from '@qovery/shared/ui'
import { type AppDispatch, type RootState } from '@qovery/state/store'

export interface ContainerProps {
  service?: AnyService
  environment?: Environment
}

export function Container({ service, environment, children }: PropsWithChildren<ContainerProps>) {
  const { organizationId = '', projectId = '', environmentId = '', databaseId = '' } = useParams()
  const location = useLocation()
  const queryClient = useQueryClient()

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state: RootState) =>
    selectClusterById(state, environment?.cluster_id || '')
  )

  const dispatch = useDispatch<AppDispatch>()
  const { data: serviceDeploymentStatus, isLoading: isLoadingServiceDeploymentStatus } = useDeploymentStatus({
    environmentId,
    serviceId: databaseId,
  })

  const headerActions = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-2">
        {environment && (
          <Skeleton width={80} height={22} show={!environment?.mode}>
            <EnvironmentMode size="xs" mode={environment.mode} />
          </Skeleton>
        )}
        <Skeleton width={120} height={22} show={!cluster}>
          <Tooltip content={cluster?.name ?? ''}>
            <Badge size="xs" variant="outline">
              <Icon name={environment?.cloud_provider.provider as IconEnum} width="16" />
              <p className="ml-1.5 max-w-[200px] truncate">{cluster?.name}</p>
            </Badge>
          </Tooltip>
        </Skeleton>
      </div>
      <Skeleton width={150} height={32} show={isLoadingServiceDeploymentStatus}>
        <div className="flex">
          {environment && service && (
            <DatabaseButtonsActions
              database={service as DatabaseEntity}
              environmentMode={environment.mode}
              clusterId={environment.cluster_id}
            />
          )}
        </div>
      </Skeleton>
    </div>
  )

  const tabsItems = [
    {
      icon: (
        <ServiceStateChip
          mode="running"
          environmentId={environmentId}
          serviceId={databaseId}
          withDeploymentFallback={service && 'mode' in service && service.mode === DatabaseModeEnum.MANAGED}
        />
      ),
      name: 'Overview',
      active:
        location.pathname === DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_GENERAL_URL,
      link: DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_GENERAL_URL,
    },
    {
      icon: <ServiceStateChip mode="deployment" environmentId={environmentId} serviceId={databaseId} />,
      name: 'Deployments',
      active:
        location.pathname ===
        DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_DEPLOYMENTS_URL,
      link: DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_DEPLOYMENTS_URL,
    },
    {
      icon: <Icon name="icon-solid-wheel" />,
      name: 'Settings',
      active: location.pathname.includes(
        DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_SETTINGS_URL
      ),
      link: DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_SETTINGS_URL,
    },
  ]

  const redeployDatabase = () => {
    if (service) {
      if (serviceDeploymentStatus?.service_deployment_status === ServiceDeploymentStatusEnum.NEVER_DEPLOYED) {
        dispatch(postDatabaseActionsDeploy({ environmentId, databaseId, queryClient }))
      } else {
        dispatch(postDatabaseActionsRedeploy({ environmentId, databaseId, queryClient }))
      }
    }
  }

  return (
    <Section className="flex-1">
      <Header title={service?.name} icon={IconEnum.DATABASE} actions={headerActions} />
      <Tabs items={tabsItems} />
      {service && serviceDeploymentStatus?.service_deployment_status !== ServiceDeploymentStatusEnum.UP_TO_DATE && (
        <NeedRedeployFlag service={service as DatabaseEntity} onClickCTA={redeployDatabase} />
      )}
      {children}
    </Section>
  )
}

export default Container
