import { BuildModeEnum, DatabaseModeEnum } from 'qovery-typescript-axios'
import { ServiceDeploymentStatusLabel, ServiceStateChip } from '@qovery/domains/services/feature'
import { ApplicationButtonsActions, DatabaseButtonsActions } from '@qovery/shared/console-shared'
import { IconEnum, type ServiceTypeEnum, isApplication, isContainer, isDatabase, isJob } from '@qovery/shared/enums'
import {
  type ApplicationEntity,
  type ContainerApplicationEntity,
  type DatabaseEntity,
  type GitApplicationEntity,
  type JobApplicationEntity,
} from '@qovery/shared/interfaces'
import {
  Icon, IconAwesomeEnum,
  Skeleton,
  type TableFilterProps,
  type TableHeadProps,
  TableRow,
  Tag,
  TagCommit,
  Tooltip, Truncate,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface TableRowServicesProps<T> {
  data: ApplicationEntity | DatabaseEntity
  filter: TableFilterProps[]
  type: ServiceTypeEnum
  environmentMode: string
  clusterId: string
  dataHead: TableHeadProps<T>[]
  link: string
  columnsWidth?: string
  removeService?: (applicationId: string, type: ServiceTypeEnum, name?: string) => void
  isLoading?: boolean
}

export function TableRowServices<T>(props: TableRowServicesProps<T>) {
  const {
    type,
    data,
    filter,
    dataHead,
    columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
    link,
    environmentMode,
    isLoading,
    clusterId,
  } = props

  const dataDatabase = data as DatabaseEntity
  const dataApplication = data as GitApplicationEntity
  const dataContainer = data as ContainerApplicationEntity
  const dataJobs = data as JobApplicationEntity

  return (
    <TableRow data={data} filter={filter} columnsWidth={columnsWidth} link={link}>
      <>
        <div className="flex items-center px-4 gap-1">
          <ServiceStateChip
            mode="running"
            environmentId={data.environment?.id}
            serviceId={data.id}
            withDeploymentFallback={dataDatabase.mode === DatabaseModeEnum.MANAGED}
          />
          <div className="ml-2 mr-2">
            <Skeleton className="shrink-0" show={isLoading} width={16} height={16}>
              <Icon name={isApplication(type) || isContainer(type) ? IconEnum.APPLICATION : type} width="20" />
            </Skeleton>
          </div>
          <Skeleton show={isLoading} width={400} height={16} truncate>
            <span className="text-sm text-neutral-400 font-medium truncate">{data.name}</span>
          </Skeleton>
        </div>
        <div className="flex justify-end justify-items-center px-3">
          <Skeleton show={isLoading} width={200} height={16}>
            <div className="flex items-center gap-3">
              <ServiceDeploymentStatusLabel environmentId={data.environment?.id} serviceId={data.id} />
              {data.name && (
                <>
                  {(isApplication(type) || isContainer(type) || isJob(type)) && (
                    <ApplicationButtonsActions
                      application={data as ApplicationEntity}
                      environmentMode={environmentMode}
                      clusterId={clusterId}
                    />
                  )}
                  {isDatabase(type) && (
                    <DatabaseButtonsActions
                      database={data as DatabaseEntity}
                      environmentMode={environmentMode}
                      clusterId={clusterId}
                    />
                  )}
                </>
              )}
            </div>
          </Skeleton>
        </div>
        <div className="flex items-center px-4 border-b-neutral-200 border-l h-full">
          <Skeleton className="w-full" show={isLoading} width={160} height={16}>
            <div className="w-full flex gap-2 items-center -mt-[1px]">
              {isApplication(type) && (
                <div className="flex items-center">
                  <TagCommit commitId={dataApplication.git_repository?.deployed_commit_id} />
                  <Icon name={IconAwesomeEnum.CODE_BRANCH} className="ml-2 mr-1 text-neutral-300 text-ssm" />
                  <span className="text-xs text-neutral-300 font-medium"><Truncate truncateLimit={20} text={dataApplication.git_repository?.branch || ''}/></span>
                </div>
              )}
              {dataJobs.source?.docker && (
                <div className="flex items-center">
                  <TagCommit commitId={dataJobs.source?.docker?.git_repository?.deployed_commit_id} />
                  <Icon name={IconAwesomeEnum.CODE_BRANCH} className="ml-2 mr-1 text-neutral-300 text-ssm" />
                  <span className="text-xs text-neutral-300 font-medium"><Truncate truncateLimit={20} text={dataJobs.source?.docker?.git_repository?.branch || ''}/></span>
                </div>
              )}
              {(isContainer(type) || dataJobs.source?.image) && (
                <Tag className="truncate border border-neutral-250 text-neutral-350 font-medium h-7">
                  <div className="block truncate">
                    {dataContainer.image_name && (
                      <Tooltip content={`${dataContainer.image_name}:${dataContainer.tag}`}>
                        <span>
                          {dataContainer.image_name}:{dataContainer.tag}
                        </span>
                      </Tooltip>
                    )}
                    {dataJobs.source?.image && (
                      <Tooltip content={`${dataJobs.source?.image?.image_name}:${dataJobs.source?.image?.tag}`}>
                        <span>
                          {dataJobs.source?.image?.image_name}:{dataJobs.source?.image?.tag}
                        </span>
                      </Tooltip>
                    )}
                  </div>
                </Tag>
              )}
              {isDatabase(type) && (
                <span className="block text-xs ml-2 text-neutral-400 font-medium">{dataDatabase.version}</span>
              )}
            </div>
          </Skeleton>
        </div>
        <div className="flex items-center px-4">
          <Skeleton show={isLoading} width={30} height={16}>
            <div className="flex items-center">
              {isDatabase(type) && (
                <Tooltip content={`${upperCaseFirstLetter(dataDatabase.mode)}`}>
                  <div>
                    <Icon name={dataDatabase.type} width="20" height="20" />
                  </div>
                </Tooltip>
              )}
              {(isApplication(type) || dataJobs.source?.docker) && (
                <Icon name={dataApplication.build_mode || BuildModeEnum.DOCKER} width="20" height="20" />
              )}
              {(isContainer(type) || dataJobs.source?.image) && (
                <Icon name={IconEnum.CONTAINER} width="20" height="20" />
              )}
            </div>
          </Skeleton>
        </div>
      </>
    </TableRow>
  )
}

export default TableRowServices
