import { getServiceType, isApplication, isJob } from '@qovery/shared/enums'
import {
  ContainerApplicationEntity,
  GitApplicationEntity,
  GitContainerApplicationEntity,
  JobApplicationEntity,
  LoadingStatus,
} from '@qovery/shared/interfaces'
import { BaseLink, HelpSection, Icon, Skeleton, Tooltip } from '@qovery/shared/ui'
import LastCommitFeature from '../../feature/last-commit-feature/last-commit-feature'
import About from '../about/about'
import ContainerCard from '../container-card/container-card'
import InstancesTable from '../instances-table/instances-table'

export interface PageGeneralProps {
  application?: GitContainerApplicationEntity
  listHelpfulLinks: BaseLink[]
  loadingStatus?: LoadingStatus
  serviceStability?: number
}

export function PageGeneral(props: PageGeneralProps) {
  const { application, listHelpfulLinks, loadingStatus, serviceStability = 0 } = props

  return (
    <div className="mt-2 bg-white rounded flex flex-grow min-h-0">
      <div className="flex flex-col flex-grow">
        <div className="py-7 px-10 flex-grow overflow-y-auto min-h-0">
          <div className="flex border border-element-light-lighter-400 mb-4">
            <div className="flex-1 border-r border-element-light-lighter-400 p-5">
              <Skeleton height={24} width={48} show={application?.instances?.loadingStatus === 'loading'}>
                <span className="text-text-600 font-bold">
                  {application?.instances?.items?.length || '–'}/{application?.max_running_instances || '-'}
                </span>
              </Skeleton>
              <span className="flex text-xs text-text-400 font-medium">
                Running instances{' '}
                <Tooltip side="right" content="Number of running instances">
                  <div className="flex items-center">
                    <Icon
                      className="cursor-pointer ml-1 text-xs text-element-light-lighter-700"
                      name="icon-solid-circle-info"
                    />
                  </div>
                </Tooltip>
              </span>
            </div>
            <div className="flex-1 p-5">
              <div className="text-text-600 font-bold mb-1">{serviceStability}</div>
              <span className="flex text-xs text-text-400 font-medium">
                Service stability
                <Tooltip
                  side="right"
                  content="Number of application instance restarts since the last deployment due to application errors"
                >
                  <div className="flex items-center">
                    <Icon
                      className="cursor-pointer ml-1 text-xs text-element-light-lighter-700"
                      name="icon-solid-circle-info"
                    />
                  </div>
                </Tooltip>
              </span>
            </div>
          </div>
          {application?.instances?.items && application.instances.items.length > 0 && (
            <InstancesTable instances={application?.instances.items} />
          )}
        </div>
        <div className="bg-white rounded-b flex flex-col justify-end">
          <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
        </div>
      </div>
      <div className="w-right-help-sidebar py-10 border-l border-element-light-lighter-400">
        <About
          description={(application as GitApplicationEntity)?.description || ''}
          link={{
            link: (application as GitApplicationEntity)?.git_repository?.url || '',
            linkLabel: (application as GitApplicationEntity)?.git_repository?.provider,
            external: true,
          }}
          buildMode={(application as GitApplicationEntity)?.build_mode}
          gitProvider={(application as GitApplicationEntity)?.git_repository?.provider}
          loadingStatus={loadingStatus}
          type={application && getServiceType(application)}
        />
        {application &&
          (isApplication(application) ? (
            <LastCommitFeature />
          ) : isJob(application) ? (
            (application as JobApplicationEntity).source?.docker ? (
              <LastCommitFeature />
            ) : (
              <ContainerCard application={application as JobApplicationEntity} />
            )
          ) : (
            <ContainerCard application={application as ContainerApplicationEntity | JobApplicationEntity} />
          ))}
      </div>
    </div>
  )
}

export default PageGeneral
