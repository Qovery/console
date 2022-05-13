import { GlobalDeploymentStatus } from 'qovery-typescript-axios'
import {
  ButtonIconAction,
  Icon,
  IconFa,
  Skeleton,
  StatusChip,
  StatusLabel,
  TableHeadProps,
  TableRow,
  TagMode,
  Tooltip,
} from '@console/shared/ui'
import { timeAgo } from '@console/shared/utils'
import { EnvironmentEntity } from '@console/shared/interfaces'

export interface TableRowEnvironmentsProps {
  data: EnvironmentEntity
  dataHead: TableHeadProps[]
  link: string
  columnsWidth?: string
}

export function TableRowEnvironments(props: TableRowEnvironmentsProps) {
  const { data, dataHead, columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`, link } = props

  const isLoading = !data.status?.id

  const buttonActionsDefault = [
    {
      iconLeft: <Icon name="icon-solid-play" />,
      iconRight: <Icon name="icon-solid-angle-down" />,
      menusClassName: 'border-r border-r-element-light-lighter-500',
      status: data.status && data.status.state,
    },
    {
      iconLeft: <Icon name="icon-solid-ellipsis-v" />,
      status: data.status && data.status.state,
    },
  ]

  return (
    <TableRow columnsWidth={columnsWidth} link={link}>
      <>
        <div className="flex items-center px-4">
          <Skeleton show={isLoading} width={16} height={16}>
            <StatusChip status={data.status && data.status.state} />
          </Skeleton>
          <Tooltip
            content={
              <p className="flex">
                {data.cloud_provider.provider && (
                  <Icon className="mr-3" name={data.cloud_provider.provider} width="16" />
                )}
                ({data.cloud_provider.cluster})
              </p>
            }
          >
            <div className="ml-3 mr-3">
              <Skeleton show={isLoading} width={16} height={16}>
                <div className="w-4 h-4.5 min-w-[16px] flex items-center justify-center text-xs text-text-400 text-center bg-element-light-lighter-400 rounded-sm font-bold cursor-pointer">
                  {data.cloud_provider.provider && data.cloud_provider.provider.charAt(0)}
                </div>
              </Skeleton>
            </div>
          </Tooltip>
          <Skeleton show={isLoading} width={400} height={16} truncate>
            <span className="text-sm text-text-500 font-medium">{data.name}</span>
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
            <div className="text-text-500">
              -{/* <IconFa name="icon-solid-infinity" className="text-success-500 mr-2 text-xs" /> */}
              {/* <span className="f text-text-500 text-sm font-medium">Continuous running</span> */}
            </div>
          </Skeleton>
        </div>
        <div className="flex items-center px-4">
          <Skeleton show={isLoading} width={30} height={16}>
            <TagMode status={data.mode} />
          </Skeleton>
        </div>
        <div className="text-text-500">-</div>
      </>
    </TableRow>
  )
}

export default TableRowEnvironments
