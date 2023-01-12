import { StateEnum } from 'qovery-typescript-axios'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { selectDatabasesEntitiesByEnvId } from '@qovery/domains/database'
import { selectClusterById } from '@qovery/domains/organization'
import { EnvironmentButtonsActions } from '@qovery/shared/console-shared'
import { IconEnum, RunningStatus } from '@qovery/shared/enums'
import { ApplicationEntity, ClusterEntity, DatabaseEntity, EnvironmentEntity } from '@qovery/shared/interfaces'
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
  Button,
  ButtonSize,
  Header,
  Icon,
  IconAwesomeEnum,
  Menu,
  MenuAlign,
  MenuData,
  Skeleton,
  StatusChip,
  Tabs,
  Tag,
  TagMode,
  TagSize,
} from '@qovery/shared/ui'
import { RootState } from '@qovery/store'

export interface ContainerProps {
  environment?: EnvironmentEntity
  children?: React.ReactNode
}

export function Container(props: ContainerProps) {
  const { environment, children } = props
  const { organizationId, projectId, environmentId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const applicationsByEnv = useSelector<RootState, ApplicationEntity[]>((state: RootState) =>
    selectApplicationsEntitiesByEnvId(state, environment?.id || '')
  )

  const databasesByEnv = useSelector<RootState, DatabaseEntity[]>((state: RootState) =>
    selectDatabasesEntitiesByEnvId(state, environment?.id || '')
  )

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state: RootState) =>
    selectClusterById(state, environment?.cluster_id || '')
  )

  const headerButtons = (
    <div>
      {/* <ButtonIcon
        icon="icon-solid-scroll"
        style={ButtonIconStyle.STROKED}
        link={`https://console.qovery.com/platform/organization/${organizationId}/projects/${projectId}/environments/${environmentId}/applications?fullscreenLogs=true`}
        external
      />
      <ButtonIcon icon="icon-solid-terminal" style={ButtonIconStyle.STROKED} />
      <ButtonIcon icon="icon-solid-clock-rotate-left" style={ButtonIconStyle.STROKED} /> */}
    </div>
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
            <span className="ml-4 mr-1 mt-2 h-4 w-[1px] bg-element-light-lighter-400"></span>
          </>
        ) : (
          <div />
        )}
      </Skeleton>
      {environment && (
        <Skeleton width={80} height={32} show={!environment?.mode}>
          <TagMode size={TagSize.BIG} status={environment?.mode} />
        </Skeleton>
      )}
      <Skeleton width={120} height={32} show={!cluster}>
        <div className="border border-element-light-lighter-400 bg-white h-8 px-3 rounded text-xs items-center inline-flex font-medium gap-2">
          <Icon name={environment?.cloud_provider.provider as IconEnum} width="16" />
          <p className="max-w-[120px] truncate">{cluster?.name}</p>
        </div>
      </Skeleton>
      <Tag className="bg-element-light-lighter-300 gap-2 hidden">
        <span className="w-2 h-2 rounded-lg bg-progressing-300"></span>
        <span className="w-2 h-2 rounded-lg bg-accent3-500"></span>
      </Tag>
    </>
  )

  const tabsItems = [
    {
      icon: (
        <StatusChip
          status={(environment?.running_status && environment?.running_status.state) || RunningStatus.STOPPED}
        />
      ),
      name: 'Services',
      active: location.pathname === `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_GENERAL_URL}`,
      link: `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_GENERAL_URL}`,
    },
    {
      icon: (
        <Skeleton show={environment?.status?.state === StateEnum.STOPPING} width={16} height={16} rounded={true}>
          <StatusChip
            mustRenameStatus
            status={(environment?.status && environment?.status.state) || StateEnum.STOPPED}
          />
        </Skeleton>
      ),
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

  const contentTabs = (
    <div className="flex justify-center items-center px-5 border-l h-14 border-element-light-lighter-400">
      <Skeleton width={154} height={40} show={!environment?.status}>
        {environment?.status ? (
          <Menu
            trigger={
              <Button size={ButtonSize.LARGE} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
                New service
              </Button>
            }
            menus={newServicesMenu}
            arrowAlign={MenuAlign.START}
          />
        ) : (
          <div />
        )}
      </Skeleton>
    </div>
  )

  return (
    <>
      <Header title={environment?.name} icon={IconEnum.APPLICATION} buttons={headerButtons} actions={headerActions} />
      <Tabs items={tabsItems} contentRight={contentTabs} />
      {children}
    </>
  )
}

export default Container
