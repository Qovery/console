import { DatabaseModeEnum, type Environment, ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import { postDatabaseActionsDeploy, postDatabaseActionsRedeploy } from '@qovery/domains/database'
import { EnvironmentMode } from '@qovery/domains/environments/feature'
import { selectClusterById } from '@qovery/domains/organization'
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
import { Header, Icon, Skeleton, Tabs, Tooltip } from '@qovery/shared/ui'
import { type AppDispatch, type RootState } from '@qovery/state/store'

export interface ContainerProps {
  database?: DatabaseEntity
  environment?: Environment
}

export function Container(props: PropsWithChildren<ContainerProps>) {
  const { database, environment, children } = props

  const { organizationId = '', projectId = '', environmentId = '', databaseId = '' } = useParams()
  const location = useLocation()

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state: RootState) =>
    selectClusterById(state, environment?.cluster_id || '')
  )

  const dispatch = useDispatch<AppDispatch>()
  const { data: serviceDeploymentStatus, isLoading: isLoadingServiceDeploymentStatus } = useDeploymentStatus({
    environmentId: database?.environment?.id,
    serviceId: database?.id,
  })

  const headerActions = (
    <>
      <Skeleton width={150} height={32} show={isLoadingServiceDeploymentStatus}>
        <div className="flex">
          {environment && database && (
            <>
              <DatabaseButtonsActions
                database={database}
                environmentMode={environment.mode}
                clusterId={environment.cluster_id}
              />
              <span className="ml-4 mr-1 mt-2 h-4 w-[1px] bg-neutral-200"></span>
            </>
          )}
        </div>
      </Skeleton>
      {environment && (
        <Skeleton width={80} height={32} show={!environment?.mode}>
          <EnvironmentMode size="sm" mode={environment.mode} />
        </Skeleton>
      )}
      <Skeleton width={120} height={32} show={!cluster}>
        <Tooltip content={cluster?.name ?? ''}>
          <div className="border border-neutral-200 bg-white h-8 px-3 rounded text-xs items-center inline-flex font-medium gap-2">
            <Icon name={environment?.cloud_provider.provider as IconEnum} width="16" />
            <p className="max-w-[200px] truncate">{cluster?.name}</p>
          </div>
        </Tooltip>
      </Skeleton>
    </>
  )

  const tabsItems = [
    {
      icon: (
        <ServiceStateChip
          mode="running"
          environmentId={database?.environment?.id}
          serviceId={database?.id}
          withDeploymentFallback={database?.mode === DatabaseModeEnum.MANAGED}
        />
      ),
      name: 'Overview',
      active:
        location.pathname === DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_GENERAL_URL,
      link: DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_GENERAL_URL,
    },
    {
      icon: <ServiceStateChip mode="deployment" environmentId={database?.environment?.id} serviceId={database?.id} />,
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
    if (database) {
      if (serviceDeploymentStatus?.service_deployment_status === ServiceDeploymentStatusEnum.NEVER_DEPLOYED) {
        dispatch(postDatabaseActionsDeploy({ environmentId, databaseId }))
      } else {
        dispatch(postDatabaseActionsRedeploy({ environmentId, databaseId }))
      }
    }
  }

  return (
    <>
      <Header title={database?.name} icon={IconEnum.DATABASE} actions={headerActions} />
      <Tabs items={tabsItems} />
      {database && serviceDeploymentStatus?.service_deployment_status !== ServiceDeploymentStatusEnum.UP_TO_DATE && (
        <NeedRedeployFlag service={database} onClickCTA={redeployDatabase} />
      )}
      {children}
    </>
  )
}

export default Container
