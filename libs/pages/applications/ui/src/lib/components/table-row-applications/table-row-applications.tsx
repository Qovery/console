import { IconEnum } from '@console/shared/enums'
import { ApplicationEntity } from '@console/shared/interfaces'
import {
  ButtonIconAction,
  Icon,
  IconFa,
  Skeleton,
  StatusChip,
  StatusLabel,
  TableHeadProps,
  TableRow,
  Avatar,
  AvatarStyle,
  TagCommit,
} from '@console/shared/ui'
import { timeAgo } from '@console/shared/utils'
import { GlobalDeploymentStatus } from 'qovery-typescript-axios'

export interface TableRowApplicationsProps {
  data: ApplicationEntity
  dataHead: TableHeadProps[]
  link: string
  columnsWidth?: string
}

export function TableRowApplications(props: TableRowApplicationsProps) {
  const { data, dataHead, columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`, link } = props

  const isLoading = !data.status?.id

  const buttonActionsDefault = [
    {
      iconLeft: <Icon name="icon-solid-play" />,
      iconRight: <Icon name="icon-solid-angle-down" />,
      menusClassName: 'border-r border-r-element-light-lighter-500',
      status: data.status?.state,
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
            <Icon name={IconEnum.APPLICATION} width="28" />
          </Skeleton>
          <Skeleton show={isLoading} width={400} height={16} truncate>
            <span className="text-sm text-text-500 font-medium truncate">{data.name}</span>
          </Skeleton>
        </div>
        <div className="flex justify-end justify-items-center px-3">
          <Skeleton show={isLoading} width={200} height={16}>
            <div className="flex">
              <p className="leading-7 text-text-400 text-sm mr-3">
                {data.status && data.status.state === GlobalDeploymentStatus.RUNNING ? (
                  <>
                    {timeAgo(data.updated_at ? new Date(data.updated_at) : new Date(data.created_at))}
                    <IconFa name="icon-solid-clock" className="ml-1 text-xxs" />
                  </>
                ) : (
                  <StatusLabel status={data.status && data.status.state} />
                )}
              </p>
              <ButtonIconAction actions={buttonActionsDefault} />
            </div>
          </Skeleton>
        </div>

        <div className="flex items-center px-4 border-b-element-light-lighter-400 border-l h-full">
          <Skeleton show={isLoading} width={160} height={16}>
            <div className="flex gap-2 items-center">
              <Avatar firstName="" lastName="" style={AvatarStyle.STROKED} size={28} />
              <TagCommit commitId={data.git_repository?.deployed_commit_id} />
            </div>
          </Skeleton>
        </div>
        <div className="flex items-center px-4">
          <Skeleton show={isLoading} width={30} height={16}>
            <Icon name={IconEnum.DOCKER} />
          </Skeleton>
        </div>
        <div className="text-text-500">-</div>
      </>
    </TableRow>
  )
}

export default TableRowApplications
