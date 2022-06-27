import { IconEnum, RunningStatus, ServicesEnum } from '@console/shared/enums'
import {
  Avatar,
  AvatarStyle,
  ButtonIconAction,
  Icon,
  Skeleton,
  StatusChip,
  StatusLabel,
  StatusMenuActions,
  TableHeadProps,
  TableRow,
  TagCommit,
} from '@console/shared/ui'
import { timeAgo } from '@console/shared/utils'
import { ApplicationEntity, DatabaseEntity } from '@console/shared/interfaces'
import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { useParams } from 'react-router'

//import React, { useEffect } from 'react'

export interface TableRowServicesProps {
  data: ApplicationEntity | DatabaseEntity
  type: ServicesEnum
  environmentMode: string
  dataHead: TableHeadProps[]
  link: string
  buttonActions: StatusMenuActions[]
  columnsWidth?: string
  removeApplication?: (serviceId: string) => void
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
    removeApplication,
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

  const buttonActionsDefaultApp = () => {
    if (removeApplication) {
      return [
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
          iconLeft: <Icon name="icon-solid-scroll" />,
          onClick: () => openLogs(),
        },
        {
          iconLeft: <Icon name="icon-solid-ellipsis-v" />,
          menus: [
            {
              items: [
                {
                  name: 'Remove',
                  contentLeft: <Icon name="icon-solid-trash" className="text-sm text-brand-400" />,
                  onClick: () => removeApplication(data.id),
                },
              ],
            },
          ],
        },
      ]
    } else {
      return [
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
          iconLeft: <Icon name="icon-solid-scroll" />,
          onClick: () => openLogs(),
        },
        /*{
          iconLeft: <Icon name="icon-solid-ellipsis-v" />,
        },*/
      ]
    }
  }

  const buttonActionsDefaultDb = [
    {
      iconLeft: <Icon name="icon-solid-play" />,
      iconRight: <Icon name="icon-solid-angle-down" />,
      statusActions: {
        status: data.status && data.status.state,
        actions: buttonActions,
      },
    },
    /*{
      iconLeft: <Icon name="icon-solid-ellipsis-v" />,
    },*/
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
            <div>
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
            </div>
          )}
          <Skeleton show={isLoading} width={16} height={16}>
            <div className="ml-2 mr-2">
              <Icon name={type === ServicesEnum.APPLICATION ? IconEnum.APPLICATION : IconEnum.DATABASE} width="20" />
            </div>
          </Skeleton>
          <Skeleton show={isLoading} width={400} height={16} truncate>
            <span className="text-sm text-text-500 font-medium truncate">{data.name}</span>
          </Skeleton>
        </div>
        <div className="flex justify-end justify-items-center px-3">
          <Skeleton show={isLoading} width={200} height={16}>
            <div className="flex items-center">
              <p className="flex items-center leading-7 text-text-400 text-sm">
                <StatusLabel status={data.status && data.status.state} />
                <span className="text-xs text-text-300 mx-3 font-medium">
                  {timeAgo(data.updated_at ? new Date(data.updated_at) : new Date(data.created_at))} ago
                </span>
              </p>
              {data.name && (
                <ButtonIconAction
                  actions={type === ServicesEnum.APPLICATION ? buttonActionsDefaultApp() : buttonActionsDefaultDb}
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
          {type === ServicesEnum.APPLICATION && (
            <Skeleton show={isLoading} width={160} height={16}>
              <div className="flex gap-2 items-center">
                {(data as ApplicationEntity).git_repository?.owner && (
                  <Avatar
                    firstName={(data as ApplicationEntity).git_repository?.owner || ''}
                    style={AvatarStyle.STROKED}
                    size={28}
                  />
                )}
                <TagCommit commitId={(data as ApplicationEntity).git_repository?.deployed_commit_id} />
              </div>
            </Skeleton>
          )}
        </div>
        <div className="flex items-center px-4">
          <Skeleton show={isLoading} width={30} height={16}>
            <div className="flex items-center">
              <Icon
                name={(data as ApplicationEntity).build_mode || (data as DatabaseEntity).type}
                width="20"
                height="20"
              />
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
