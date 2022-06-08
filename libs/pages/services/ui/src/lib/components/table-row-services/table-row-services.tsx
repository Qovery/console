import { IconEnum } from '@console/shared/enums'
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
import { ServicesEnum } from '../general/general'
import { ApplicationEntity, DatabaseEntity } from '@console/shared/interfaces'

export interface TableRowServicesProps {
  data: ApplicationEntity | DatabaseEntity
  type: ServicesEnum
  environmentMode: string
  dataHead: TableHeadProps[]
  link: string
  buttonActions: StatusMenuActions[]
  columnsWidth?: string
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
  } = props

  const isLoading = !data.status?.id

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
      iconLeft: <Icon name="icon-solid-scroll" />,
    },
    {
      iconLeft: <Icon name="icon-solid-ellipsis-v" />,
    },
  ]

  return (
    <TableRow columnsWidth={columnsWidth} link={link}>
      <>
        <div className="flex items-center px-4 gap-1">
          <Skeleton show={isLoading} width={16} height={16}>
            <StatusChip status={data.status && data.status.state} />
          </Skeleton>
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
                  actions={buttonActionsDefault}
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
            <div className="flex">
              <Icon name={(data as ApplicationEntity).build_mode || (data as DatabaseEntity).type} />
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
