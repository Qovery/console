import {
  ButtonIconAction,
  Icon,
  Skeleton,
  StatusChip,
  StatusLabel,
  StatusMenuActions,
  TableHeadProps,
  TableRow,
  TagMode,
  Tooltip,
} from '@console/shared/ui'
import { timeAgo } from '@console/shared/utils'
import { EnvironmentEntity } from '@console/shared/interfaces'
import { RunningStatus } from '@console/shared/enums'

export interface TableRowEnvironmentsProps {
  data: EnvironmentEntity
  dataHead: TableHeadProps[]
  link: string
  buttonActions: StatusMenuActions[]
  removeEnvironment?: (environmentId: string) => void
  columnsWidth?: string
}

export function TableRowEnvironments(props: TableRowEnvironmentsProps) {
  const {
    data,
    dataHead,
    columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
    link,
    buttonActions,
    removeEnvironment,
  } = props

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
      ...(removeEnvironment && {
        iconLeft: <Icon name="icon-solid-ellipsis-vertical" />,
        menus: [
          {
            items: [
              {
                name: 'Remove',
                contentLeft: <Icon name="icon-solid-trash" className="text-sm text-brand-400" />,
                onClick: () => removeEnvironment(data.id),
              },
            ],
          },
        ],
      }),
    },
  ]

  const isLoading = !data.status?.id

  return (
    <TableRow columnsWidth={columnsWidth} link={link} disabled={isLoading}>
      <>
        <div className="flex items-center px-4">
          <Skeleton className="shrink-0" show={isLoading} width={16} height={16}>
            <StatusChip status={(data.running_status && data.running_status.state) || RunningStatus.STOPPED} />
          </Skeleton>
          <Tooltip
            content={
              <p className="flex">
                {data.cloud_provider.provider && (
                  <Icon className="mr-3" name={`${data.cloud_provider.provider}_GRAY`} width="16" />
                )}
                ({data.cloud_provider.cluster})
              </p>
            }
          >
            <div className="ml-3 mr-3">
              <Skeleton show={isLoading} width={16} height={16}>
                <div className="cursor-pointer mt-0.5">
                  {data.cloud_provider.provider && <Icon name={`${data.cloud_provider.provider}_GRAY`} />}
                </div>
              </Skeleton>
            </div>
          </Tooltip>
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
              <ButtonIconAction
                actions={buttonActionsDefault}
                statusInformation={{
                  id: data.id,
                  name: data.name,
                  mode: data.mode,
                }}
              />
            </div>
          </Skeleton>
        </div>
        <div className="flex items-center px-4 border-b-element-light-lighter-400 border-l h-full">
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
