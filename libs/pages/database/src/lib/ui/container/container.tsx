import { Environment } from 'qovery-typescript-axios'
import { useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import { selectClusterById } from '@qovery/domains/organization'
import { DatabaseButtonsActions } from '@qovery/shared/console-shared'
import { IconEnum, RunningStatus } from '@qovery/shared/enums'
import { ClusterEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import {
  DATABASE_DEPLOYMENTS_URL,
  DATABASE_GENERAL_URL,
  DATABASE_SETTINGS_URL,
  DATABASE_URL,
} from '@qovery/shared/routes'
import { Header, Icon, Skeleton, StatusChip, Tabs, Tag, TagMode, TagSize } from '@qovery/shared/ui'
import { RootState } from '@qovery/store'

export interface ContainerProps {
  database?: DatabaseEntity
  environment?: Environment
  children?: React.ReactNode
}

export function Container(props: ContainerProps) {
  const { database, environment, children } = props

  const { organizationId, projectId, environmentId, databaseId } = useParams()
  const location = useLocation()

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state: RootState) =>
    selectClusterById(state, environment?.cluster_id || '')
  )

  const headerActions = (
    <>
      <Skeleton width={150} height={32} show={!database?.status}>
        <div className="flex">
          {environment && database && database?.status && (
            <>
              <DatabaseButtonsActions database={database} environmentMode={environment.mode} />
              <span className="ml-4 mr-1 mt-2 h-4 w-[1px] bg-element-light-lighter-400"></span>
            </>
          )}
        </div>
      </Skeleton>
      {environment && (
        <Skeleton width={80} height={32} show={!environment?.mode}>
          <TagMode status={environment?.mode} size={TagSize.BIG} />
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
        <StatusChip status={(database?.running_status && database?.running_status.state) || RunningStatus.STOPPED} />
      ),
      name: 'Overview',
      active:
        location.pathname === DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_GENERAL_URL,
      link: DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_GENERAL_URL,
    },
    {
      icon: (
        <Skeleton width={16} height={16} rounded show={!database?.status}>
          <StatusChip mustRenameStatus status={database?.status && database?.status.state} />
        </Skeleton>
      ),
      name: 'Deployments',
      active:
        location.pathname ===
        DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_DEPLOYMENTS_URL,
      link: DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_DEPLOYMENTS_URL,
    },
    // {
    //   icon: <Icon name="icon-solid-chart-area" />,
    //   name: 'Metrics',
    //   active:
    //     location.pathname === DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_METRICS_URL,
    //   link: DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_METRICS_URL,
    // },
    // {
    //   icon: <Icon name="icon-solid-wheel" />,
    //   name: 'Variables',
    //   active:
    //     location.pathname ===
    //     DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_VARIABLES_URL,
    //   link: DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_VARIABLES_URL,
    // },
    {
      icon: <Icon name="icon-solid-wheel" />,
      name: 'Settings',
      active: location.pathname.includes(
        DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_SETTINGS_URL
      ),
      link: DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_SETTINGS_URL,
    },
  ]

  return (
    <>
      <Header title={database?.name} icon={IconEnum.DATABASE} actions={headerActions} />
      <Tabs items={tabsItems} />
      {children}
    </>
  )
}

export default Container
