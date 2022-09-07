import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { useParams } from 'react-router'
import { IconEnum, RunningStatus, ServicesEnum } from '@console/shared/enums'
import { ApplicationEntity, DatabaseEntity } from '@console/shared/interfaces'
import {
  ButtonIconAction,
  Icon,
  Skeleton,
  StatusChip,
  StatusLabel,
  StatusMenuActions,
  TableHeadProps,
  TableRow,
  Tag,
  TagCommit,
  Tooltip,
} from '@console/shared/ui'
import { timeAgo, upperCaseFirstLetter, urlCodeEditor } from '@console/shared/utils'

export interface TableRowServicesProps {
  data: ApplicationEntity | DatabaseEntity
  type: ServicesEnum
  environmentMode: string
  dataHead: TableHeadProps[]
  link: string
  buttonActions: StatusMenuActions[]
  columnsWidth?: string
  removeService?: (applicationId: string, type: ServicesEnum, name?: string) => void
}

export function TableRowServices(props: TableRowServicesProps) {
  const {
    type,
    data,
    dataHead,
    columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
    link,
    buttonActions,
    environmentMode,
    removeService,
  } = props

  const { organizationId, projectId, environmentId } = useParams()

  const isLoading = !data.status?.id

  const openLogs = () => {
    window
      .open(
        `https://console.qovery.com/platform/organization/${organizationId}/projects/${projectId}/environments/${environmentId}/applications/${data.id}/summary?fullscreenLogs=true`,
        '_blank'
      )
      ?.focus()
  }

  const buttonActionsDefault = [
    {
      iconLeft: <Icon name="icon-solid-play" />,
      iconRight: <Icon name="icon-solid-angle-down" />,
      menusClassName: 'border-r border-r-element-light-lighter-500',
      statusActions: {
        status: data.status && data.status.state,
        actions: buttonActions,
      },
    },
    {
      ...(type === ServicesEnum.APPLICATION && {
        iconLeft: <Icon name="icon-solid-scroll" />,
        onClick: () => openLogs(),
      }),
    },
    {
      ...(removeService && {
        iconLeft: <Icon name="icon-solid-ellipsis-v" />,
        menus: [
          {
            items:
              type === ServicesEnum.APPLICATION
                ? [
                    {
                      name: 'Edit code',
                      contentLeft: <Icon name="icon-solid-code" className="text-sm text-brand-400" />,
                      link: {
                        url: urlCodeEditor((data as ApplicationEntity).git_repository) || '',
                        external: true,
                      },
                    },
                    {
                      name: 'Remove',
                      contentLeft: <Icon name="icon-solid-trash" className="text-sm text-brand-400" />,
                      onClick: () => removeService(data.id, ServicesEnum.APPLICATION, data.name),
                    },
                  ]
                : [
                    {
                      name: 'Remove',
                      contentLeft: <Icon name="icon-solid-trash" className="text-sm text-brand-400" />,
                      onClick: () => removeService(data.id, ServicesEnum.CONTAINER, data.name),
                    },
                  ],
          },
        ],
      }),
    },
  ]

  const buttonActionsDefaultDB = [
    {
      iconLeft: <Icon name="icon-solid-play" />,
      iconRight: <Icon name="icon-solid-angle-down" />,
      menusClassName: removeService ? 'border-r border-r-element-light-lighter-500' : '',
      statusActions: {
        status: data.status && data.status.state,
        actions: buttonActions,
      },
    },
    {
      ...(removeService && {
        iconLeft: <Icon name="icon-solid-ellipsis-v" />,
        menus: [
          {
            items: [
              {
                name: 'Remove',
                contentLeft: <Icon name="icon-solid-trash" className="text-sm text-brand-400" />,
                onClick: () => removeService(data.id, ServicesEnum.DATABASE, data.name),
              },
            ],
          },
        ],
      }),
    },
  ]

  return (
    <TableRow columnsWidth={columnsWidth} link={link}>
      <>
        <div className="flex items-center px-4 gap-1">
          {(data as DatabaseEntity).mode === DatabaseModeEnum.MANAGED ? (
            <Skeleton show={isLoading} width={16} height={16} rounded={true}>
              <StatusChip status={data.status && data.status.state} />
            </Skeleton>
          ) : (
            <Skeleton className="shrink-0" show={isLoading} width={16} height={16}>
              {(data as DatabaseEntity).mode === DatabaseModeEnum.MANAGED ? (
                <StatusChip status={data.status && data.status.state} />
              ) : (
                <StatusChip
                  status={(data.running_status && data.running_status.state) || RunningStatus.STOPPED}
                  appendTooltipMessage={
                    data?.running_status?.state === RunningStatus.ERROR
                      ? data.running_status.pods[0]?.state_message
                      : ''
                  }
                />
              )}
            </Skeleton>
          )}
          <div className="ml-2 mr-2">
            <Skeleton className="shrink-0" show={isLoading} width={16} height={16}>
              <Icon name={type === ServicesEnum.DATABASE ? IconEnum.DATABASE : IconEnum.APPLICATION} width="20" />
            </Skeleton>
          </div>
          <Skeleton show={isLoading} width={400} height={16} truncate>
            <span className="text-sm text-text-500 font-medium truncate">{data.name}</span>
          </Skeleton>
        </div>
        <div className="flex justify-end justify-items-center px-3">
          <Skeleton show={isLoading} width={200} height={16}>
            <div className="flex items-center">
              <p className="flex items-center leading-7 text-text-400 text-sm">
                <StatusLabel status={data.status && data.status.state} />
                {data.status?.last_deployment_date && (
                  <span className="text-xs text-text-300 mx-3 font-medium">
                    {timeAgo(new Date(data.status.last_deployment_date))} ago
                  </span>
                )}
              </p>
              {data.name && (
                <ButtonIconAction
                  actions={type === ServicesEnum.DATABASE ? buttonActionsDefaultDB : buttonActionsDefault}
                  statusInformation={{
                    id: data.id,
                    name: data.name,
                    mode: environmentMode,
                  }}
                />
              )}
            </div>
          </Skeleton>
        </div>
        <div className="flex items-center px-4 border-b-element-light-lighter-400 border-l h-full">
          {type !== ServicesEnum.DATABASE && (
            <Skeleton show={isLoading} width={160} height={16}>
              <div className="flex gap-2 items-center">
                {type === ServicesEnum.APPLICATION && (
                  <TagCommit commitId={(data as ApplicationEntity).git_repository?.deployed_commit_id} />
                )}
                {type === ServicesEnum.CONTAINER && (
                  <Tag className="border border-element-light-lighter-500 text-text-400 font-medium h-7 flex items-center justify-center">
                    {(data as ApplicationEntity).image_name}
                  </Tag>
                )}
              </div>
            </Skeleton>
          )}
        </div>
        <div className="flex items-center px-4">
          <Skeleton show={isLoading} width={30} height={16}>
            <div className="flex items-center">
              {type === ServicesEnum.DATABASE && (
                <Tooltip content={`${upperCaseFirstLetter((data as DatabaseEntity).mode)}`}>
                  <div>
                    <Icon name={(data as DatabaseEntity).type} width="20" height="20" />
                  </div>
                </Tooltip>
              )}
              {type === ServicesEnum.APPLICATION && (
                <Icon name={(data as ApplicationEntity).build_mode || ''} width="20" height="20" />
              )}
              {type === ServicesEnum.CONTAINER && <Icon name={IconEnum.CONTAINER} width="20" height="20" />}
              {(data as DatabaseEntity).version && (
                <span className="block text-xs ml-2 text-text-600 font-medium">
                  v{(data as DatabaseEntity).version}
                </span>
              )}
            </div>
          </Skeleton>
        </div>
        <div className="text-text-500">-</div>
      </>
    </TableRow>
  )
}

export default TableRowServices
