import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { ApplicationButtonsActions, DatabaseButtonsActions } from '@qovery/shared/console-shared'
import { IconEnum, RunningStatus, ServiceTypeEnum } from '@qovery/shared/enums'
import {
  ApplicationEntity,
  ContainerApplicationEntity,
  DatabaseEntity,
  GitApplicationEntity,
} from '@qovery/shared/interfaces'
import {
  Icon,
  Skeleton,
  StatusChip,
  StatusLabel,
  TableFilterProps,
  TableHeadProps,
  TableRow,
  Tag,
  TagCommit,
  Tooltip,
} from '@qovery/shared/ui'
import { timeAgo, upperCaseFirstLetter } from '@qovery/shared/utils'

export interface TableRowServicesProps {
  data: ApplicationEntity | DatabaseEntity
  filter: TableFilterProps
  type: ServiceTypeEnum
  environmentMode: string
  dataHead: TableHeadProps[]
  link: string
  columnsWidth?: string
  removeService?: (applicationId: string, type: ServiceTypeEnum, name?: string) => void
  isLoading?: boolean
}

export function TableRowServices(props: TableRowServicesProps) {
  const {
    type,
    data,
    filter,
    dataHead,
    columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
    link,
    environmentMode,
    isLoading,
  } = props

  return (
    <TableRow data={data} filter={filter} columnsWidth={columnsWidth} link={link}>
      <>
        <div className="flex items-center px-4 gap-1">
          {(data as DatabaseEntity).mode === DatabaseModeEnum.MANAGED ? (
            <Skeleton show={isLoading} width={16} height={16} rounded={true}>
              <StatusChip status={data.status?.state} />
            </Skeleton>
          ) : (
            <Skeleton className="shrink-0" show={isLoading} width={16} height={16}>
              {(data as DatabaseEntity).mode === DatabaseModeEnum.MANAGED ? (
                <StatusChip status={data.status?.state} />
              ) : (
                <StatusChip
                  status={data.running_status?.state || RunningStatus.STOPPED}
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
              <Icon name={type === ServiceTypeEnum.DATABASE ? IconEnum.DATABASE : IconEnum.APPLICATION} width="20" />
            </Skeleton>
          </div>
          <Skeleton show={isLoading} width={400} height={16} truncate>
            <span className="text-sm text-text-500 font-medium truncate">{data.name}</span>
          </Skeleton>
        </div>
        <div className="flex justify-end justify-items-center px-3">
          <Skeleton show={isLoading} width={200} height={16}>
            <div className="flex items-center gap-3">
              <p className="flex items-center gap-3 leading-7 text-text-400 text-sm">
                {data.status && data.status.state && <StatusLabel status={data.status && data.status.state} />}
                {data.status?.last_deployment_date && (
                  <span className="text-xs text-text-300 font-medium">
                    {timeAgo(new Date(data.status.last_deployment_date))} ago
                  </span>
                )}
              </p>
              {data.name && (
                <>
                  {type === ServiceTypeEnum.APPLICATION || type === ServiceTypeEnum.CONTAINER ? (
                    <ApplicationButtonsActions
                      application={data as ApplicationEntity}
                      environmentMode={environmentMode}
                    />
                  ) : (
                    <DatabaseButtonsActions database={data as DatabaseEntity} environmentMode="environmentMode" />
                  )}
                </>
              )}
            </div>
          </Skeleton>
        </div>
        <div className="flex items-center px-4 border-b-element-light-lighter-400 border-l h-full">
          <Skeleton className="w-full" show={isLoading} width={160} height={16}>
            <div className="w-full flex gap-2 items-center -mt-[1px]">
              {type === ServiceTypeEnum.APPLICATION && (
                <TagCommit commitId={(data as GitApplicationEntity).git_repository?.deployed_commit_id} />
              )}
              {type === ServiceTypeEnum.CONTAINER && (
                <Tag className="truncate border border-element-light-lighter-500 text-text-400 font-medium h-7">
                  <span className="block truncate">
                    <Tooltip
                      content={`${(data as ContainerApplicationEntity).image_name}:${
                        (data as ContainerApplicationEntity).tag
                      }`}
                    >
                      <span>
                        {(data as ContainerApplicationEntity).image_name}:{(data as ContainerApplicationEntity).tag}
                      </span>
                    </Tooltip>
                  </span>
                </Tag>
              )}
              {type === ServiceTypeEnum.DATABASE && (
                <span className="block text-xs ml-2 text-text-600 font-medium">{(data as DatabaseEntity).version}</span>
              )}
            </div>
          </Skeleton>
        </div>
        <div className="flex items-center px-4">
          <Skeleton show={isLoading} width={30} height={16}>
            <div className="flex items-center">
              {type === ServiceTypeEnum.DATABASE && (
                <Tooltip content={`${upperCaseFirstLetter((data as DatabaseEntity).mode)}`}>
                  <div>
                    <Icon name={(data as DatabaseEntity).type} width="20" height="20" />
                  </div>
                </Tooltip>
              )}
              {type === ServiceTypeEnum.APPLICATION && (
                <Icon name={(data as GitApplicationEntity).build_mode || ''} width="20" height="20" />
              )}
              {type === ServiceTypeEnum.CONTAINER && <Icon name={IconEnum.CONTAINER} width="20" height="20" />}
            </div>
          </Skeleton>
        </div>
      </>
    </TableRow>
  )
}

export default TableRowServices
