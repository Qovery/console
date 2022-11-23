import { EnvironmentButtonsActions } from '@qovery/shared/console-shared'
import { RunningStatus } from '@qovery/shared/enums'
import { EnvironmentEntity } from '@qovery/shared/interfaces'
import {
  Icon,
  Skeleton,
  StatusChip,
  StatusLabel,
  TableFilterProps,
  TableHeadProps,
  TableRow,
  TagMode,
  Tooltip,
} from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/utils'

export interface TableRowEnvironmentsProps {
  data: EnvironmentEntity
  filter: TableFilterProps
  dataHead: TableHeadProps[]
  link: string
  columnsWidth?: string
}

export function TableRowEnvironments(props: TableRowEnvironmentsProps) {
  const { data, dataHead, columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`, link, filter } = props

  const isLoading = !data.status?.id

  return (
    <TableRow data={data} filter={filter} columnsWidth={columnsWidth} link={link} disabled={isLoading}>
      <>
        <div className="flex items-center px-4">
          <Skeleton className="shrink-0" show={isLoading} width={16} height={16}>
            <StatusChip status={(data.running_status && data.running_status.state) || RunningStatus.STOPPED} />
          </Skeleton>
          <Tooltip
            content={
              <p className="flex">
                {data.cloud_provider.provider && (
                  <Icon className="mr-2" name={`${data.cloud_provider.provider}_GRAY`} width="16" />
                )}
                {data.cluster_name} ({data.cloud_provider.cluster})
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
              <EnvironmentButtonsActions environment={data} hasServices={true} />
            </div>
          </Skeleton>
        </div>
        <div className="flex items-center px-4 border-b-element-light-lighter-400 border-l h-full">
          <Skeleton show={isLoading} width={30} height={16}>
            <TagMode status={data.mode} />
          </Skeleton>
        </div>
      </>
    </TableRow>
  )
}

export default TableRowEnvironments
