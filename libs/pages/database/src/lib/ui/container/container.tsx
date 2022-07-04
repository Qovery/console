import { IconEnum, RunningStatus } from '@console/shared/enums'
import {
  ButtonIconAction,
  Header,
  Icon,
  Skeleton,
  StatusChip,
  StatusMenuActions,
  Tabs,
  Tag,
  TagMode,
  TagSize,
} from '@console/shared/ui'
import {
  DATABASE_DEPLOYMENTS_URL,
  DATABASE_GENERAL_URL,
  //DATABASE_METRICS_URL,
  DATABASE_SETTINGS_URL,
  DATABASE_URL,
  //DATABASE_VARIABLES_URL,
} from '@console/shared/router'
import { Environment } from 'qovery-typescript-axios'
import { useLocation, useParams } from 'react-router'
import { DatabaseEntity } from '@console/shared/interfaces'

export interface ContainerProps {
  statusActions: StatusMenuActions[]
  database?: DatabaseEntity
  environment?: Environment
  children?: React.ReactNode
  removeDatabase?: (databaseId: string) => void
}

export function Container(props: ContainerProps) {
  const { database, environment, children, statusActions, removeDatabase } = props

  const { organizationId, projectId, environmentId, databaseId } = useParams()
  const location = useLocation()

  const copyContent = `Organization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environmentId}\nService ID: ${databaseId}`

  const buttonActionsDefault = [
    {
      iconLeft: <Icon name="icon-solid-play" className="px-0.5" />,
      iconRight: <Icon name="icon-solid-angle-down" className="px-0.5" />,
      menusClassName: removeDatabase ? 'border-r border-r-element-light-lighter-500' : '',
      statusActions: {
        status: database?.status && database?.status.state,
        actions: statusActions,
      },
    },
    {
      ...(removeDatabase && {
        iconLeft: <Icon name="icon-solid-ellipsis-v" className="px-0.5" />,
        menus: [
          {
            items: [
              {
                name: 'Remove',
                contentLeft: <Icon name="icon-solid-trash" className="text-sm text-brand-400" />,
                onClick: () => removeDatabase(databaseId ? databaseId : ''),
              },
            ],
          },
        ],
      }),
    },
  ]

  const headerActions = (
    <>
      <Skeleton width={150} height={24} show={!database?.status}>
        <div className="flex">
          {environment && database && database?.status && (
            <>
              <ButtonIconAction
                className="!h-8"
                actions={buttonActionsDefault}
                statusInformation={{
                  id: database?.id,
                  name: database?.name,
                  mode: environment?.mode,
                }}
              />
              <span className="ml-4 mr-1 mt-2 h-4 w-[1px] bg-element-light-lighter-400"></span>
            </>
          )}
        </div>
      </Skeleton>
      {environment && (
        <Skeleton width={80} height={24} show={!environment?.mode}>
          <TagMode status={environment?.mode} size={TagSize.BIG} />
        </Skeleton>
      )}
      <Skeleton width={100} height={24} show={!environment?.cloud_provider}>
        <div className="border border-element-light-lighter-400 bg-white h-8 px-3 rounded text-xs items-center inline-flex font-medium gap-2">
          <Icon name={environment?.cloud_provider.provider as IconEnum} width="16" />
          <p className="max-w-[54px] truncate">{environment?.cloud_provider.cluster}</p>
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
          <StatusChip status={database?.status && database?.status.state} />
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
      active:
        location.pathname ===
        DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_SETTINGS_URL,
      link: DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_SETTINGS_URL,
    },
  ]

  return (
    <>
      <Header
        title={database?.name}
        icon={IconEnum.DATABASE}
        copyTitle
        copyContent={copyContent}
        actions={headerActions}
      />
      <Tabs items={tabsItems} />
      {children}
    </>
  )
}

export default Container
