import { type Environment } from 'qovery-typescript-axios'
import { EnvironmentDeploymentStatusLabel, EnvironmentStateChip } from '@qovery/domains/environments/feature'
import { EnvironmentButtonsActions } from '@qovery/shared/console-shared'
import {
  Icon,
  Skeleton,
  type TableFilterProps,
  type TableHeadProps,
  TableRow,
  TagMode,
  Tooltip,
} from '@qovery/shared/ui'

export interface TableRowEnvironmentsProps {
  data: Environment
  filter: TableFilterProps[]
  dataHead: TableHeadProps<Environment>[]
  link: string
  columnsWidth?: string
  isLoading?: boolean
}

export function TableRowEnvironments(props: TableRowEnvironmentsProps) {
  const {
    data,
    dataHead,
    columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
    link,
    filter,
    isLoading = false,
  } = props

  return (
    <TableRow data={data} filter={filter} columnsWidth={columnsWidth} link={link} disabled={isLoading}>
      <>
        <div className="flex items-center px-4">
          <EnvironmentStateChip mode="running" environmentId={data.id} />
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
            <span className="text-sm text-neutral-400 font-medium truncate">{data.name}</span>
          </Skeleton>
        </div>
        <div className="flex justify-end justify-items-center px-3">
          <Skeleton show={isLoading} width={200} height={16}>
            <div className="flex items-center gap-3">
              <EnvironmentDeploymentStatusLabel environmentId={data.id} />
              <EnvironmentButtonsActions environment={data} hasServices={true} />
            </div>
          </Skeleton>
        </div>
        <div className="flex items-center px-4 border-b-neutral-200 border-l h-full">
          <Skeleton show={isLoading} width={30} height={16}>
            <TagMode status={data.mode} />
          </Skeleton>
        </div>
      </>
    </TableRow>
  )
}

export default TableRowEnvironments
