import { Environment, ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import { postDatabaseActionsDeploy, postDatabaseActionsRedeploy } from '@qovery/domains/database'
import { selectClusterById } from '@qovery/domains/organization'
import { DatabaseButtonsActions, NeedRedeployFlag } from '@qovery/shared/console-shared'
import { IconEnum, RunningState } from '@qovery/shared/enums'
import { ClusterEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import {
  DATABASE_DEPLOYMENTS_URL,
  DATABASE_GENERAL_URL,
  DATABASE_SETTINGS_URL,
  DATABASE_URL,
} from '@qovery/shared/routes'
import { Header, Icon, Skeleton, StatusChip, Tabs, Tag, TagMode, TagSize } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/state/store'

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

  const headerActions = (
    <>
      <Skeleton width={150} height={32} show={!database?.status}>
        <div className="flex">
          {environment && database && database?.status && (
            <>
              <DatabaseButtonsActions
                database={database}
                environmentMode={environment.mode}
                clusterId={environment.cluster_id}
              />
              <span className="ml-4 mr-1 mt-2 h-4 w-[1px] bg-zinc-200"></span>
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
        <div className="border border-zinc-200 bg-white h-8 px-3 rounded text-xs items-center inline-flex font-medium gap-2">
          <Icon name={environment?.cloud_provider.provider as IconEnum} width="16" />
          <p className="max-w-[120px] truncate">{cluster?.name}</p>
        </div>
      </Skeleton>
      <Tag className="bg-zinc-150 gap-2 hidden">
        <span className="w-2 h-2 rounded-lg bg-orange-300"></span>
        <span className="w-2 h-2 rounded-lg bg-teal-500"></span>
      </Tag>
    </>
  )

  const tabsItems = [
    {
      icon: (
        <StatusChip status={(database?.running_status && database?.running_status.state) || RunningState.STOPPED} />
      ),
      name: 'Overview',
      active:
        location.pathname === DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_GENERAL_URL,
      link: DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_GENERAL_URL,
    },
    {
      icon: (
        <Skeleton width={16} height={16} rounded show={!database?.status}>
          <StatusChip status={database?.status && database?.status.state} />
        </Skeleton>
      ),
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
      if (database?.status?.service_deployment_status === ServiceDeploymentStatusEnum.NEVER_DEPLOYED) {
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
      {database &&
        database.status &&
        database.status.service_deployment_status !== ServiceDeploymentStatusEnum.UP_TO_DATE && (
          <NeedRedeployFlag service={database} onClickCTA={redeployDatabase} />
        )}
      {children}
    </>
  )
}

export default Container
