import { type Environment } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { selectDatabasesEntitiesByEnvId } from '@qovery/domains/database'
import { EnvironmentMode, EnvironmentStateChip } from '@qovery/domains/environments/feature'
import { selectClusterById } from '@qovery/domains/organization'
import { useDeploymentStatus } from '@qovery/domains/services/feature'
import { EnvironmentButtonsActions } from '@qovery/shared/console-shared'
import { IconEnum } from '@qovery/shared/enums'
import { type ApplicationEntity, type ClusterEntity, type DatabaseEntity } from '@qovery/shared/interfaces'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CRONJOB_CREATION_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_DEPLOYMENTS_URL,
  SERVICES_GENERAL_URL,
  SERVICES_LIFECYCLE_CREATION_URL,
  SERVICES_SETTINGS_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import {
  ButtonLegacy,
  ButtonSize,
  Header,
  Icon,
  IconAwesomeEnum,
  Menu,
  MenuAlign,
  type MenuData,
  Skeleton,
  Tabs,
  Tooltip,
} from '@qovery/shared/ui'
import { type RootState } from '@qovery/state/store'

export interface ContainerProps {
  environment?: Environment
}

export function Container(props: PropsWithChildren<ContainerProps>) {
  const { environment, children } = props
  const { organizationId, projectId, environmentId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const { isLoading: isLoadingDeploymentStatus } = useDeploymentStatus({
    environmentId: environment?.id,
  })

  const applicationsByEnv = useSelector<RootState, ApplicationEntity[]>((state: RootState) =>
    selectApplicationsEntitiesByEnvId(state, environment?.id || '')
  )

  const databasesByEnv = useSelector<RootState, DatabaseEntity[]>((state: RootState) =>
    selectDatabasesEntitiesByEnvId(state, environment?.id || '')
  )

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state: RootState) =>
    selectClusterById(state, environment?.cluster_id || '')
  )

  const matchSettingsRoute = location.pathname.includes(
    SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_SETTINGS_URL
  )

  const headerActions = (
    <>
      <Skeleton width={150} height={32} show={!environment}>
        {environment ? (
          <>
            <EnvironmentButtonsActions
              environment={environment}
              hasServices={Boolean(applicationsByEnv?.length || databasesByEnv?.length)}
            />
            <span className="ml-4 mr-1 mt-2 h-4 w-[1px] bg-neutral-200"></span>
          </>
        ) : (
          <div />
        )}
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
      icon: <EnvironmentStateChip mode="running" environmentId={environmentId} />,
      name: 'Services',
      active: location.pathname === `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_GENERAL_URL}`,
      link: `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_GENERAL_URL}`,
    },
    {
      icon: <EnvironmentStateChip mode="deployment" environmentId={environmentId} />,
      name: 'Deployments',
      active:
        location.pathname === `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_DEPLOYMENTS_URL}`,
      link: `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_DEPLOYMENTS_URL}`,
    },
    {
      icon: <Icon name="icon-solid-wheel" />,
      name: 'Settings',
      active: location.pathname.includes(
        `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_SETTINGS_URL}`
      ),
      link: `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_SETTINGS_URL}`,
    },
  ]

  const newServicesMenu: MenuData = [
    {
      items: [
        {
          name: 'Create application',
          contentLeft: <Icon name={IconAwesomeEnum.LAYER_GROUP} className="text-brand-500 text-sm" />,
          onClick: () => {
            navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`)
          },
        },
        {
          name: 'Create database',
          contentLeft: <Icon name={IconAwesomeEnum.DATABASE} className="text-brand-500 text-sm" />,
          onClick: () => {
            navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_DATABASE_CREATION_URL}`)
          },
        },
        {
          name: 'Create lifecycle job',
          contentLeft: (
            <Icon name={IconEnum.LIFECYCLE_JOB_STROKE} width="14" height="16" className="text-brand-500 text-sm" />
          ),
          onClick: () => {
            navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_LIFECYCLE_CREATION_URL}`)
          },
        },
        {
          name: 'Create cronjob',
          contentLeft: (
            <Icon name={IconEnum.CRON_JOB_STROKE} width="14" height="16" className="text-brand-500 text-sm" />
          ),
          onClick: () => {
            navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_CRONJOB_CREATION_URL}`)
          },
        },
      ],
    },
  ]

  const contentTabs = !matchSettingsRoute && (
    <div className="flex justify-center items-center px-5 border-l h-14 border-neutral-200">
      <Skeleton width={154} height={40} show={isLoadingDeploymentStatus}>
        <Menu
          trigger={
            <ButtonLegacy size={ButtonSize.LARGE} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
              New service
            </ButtonLegacy>
          }
          menus={newServicesMenu}
          arrowAlign={MenuAlign.START}
        />
      </Skeleton>
    </div>
  )

  return (
    <>
      <Header title={environment?.name} icon={IconEnum.APPLICATION} actions={headerActions} />
      <Tabs items={tabsItems} contentRight={contentTabs} />
      {children}
    </>
  )
}

export default Container
