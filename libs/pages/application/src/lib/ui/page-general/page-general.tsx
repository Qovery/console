import { ContainerRegistryResponse } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { isApplication, isGitJob, isJob } from '@qovery/shared/enums'
import { ApplicationEntity, JobApplicationEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { BaseLink, HelpSection, Icon, Skeleton, Tooltip } from '@qovery/shared/ui'
import About from '../about/about'
import AboutContainer from '../about/about-container/about-container'
import AboutGit from '../about/about-git/about-git'
import AboutUpdate from '../about/about-update/about-update'
import InstancesTable from '../instances-table/instances-table'
import JobOverview from '../job-overview/job-overview'

export interface PageGeneralProps {
  application?: ApplicationEntity
  listHelpfulLinks: BaseLink[]
  loadingStatus?: LoadingStatus
  serviceStability?: number
  currentRegistry?: ContainerRegistryResponse
}

export function PageGeneral(props: PageGeneralProps) {
  const { application, listHelpfulLinks, loadingStatus, serviceStability = 0 } = props
  const { organizationId = '' } = useParams()

  return (
    <div className="mt-2 bg-white rounded flex flex-grow min-h-0">
      <div className="flex flex-col flex-grow">
        <div className="py-7 px-10 flex-grow overflow-y-auto min-h-0">
          {!isJob(application) ? (
            <>
              <div className="flex border border-element-light-lighter-400 mb-4">
                <div className="flex-1 border-r border-element-light-lighter-400 p-5">
                  <Skeleton height={24} width={48} show={application?.instances?.loadingStatus === 'loading'}>
                    <span className="text-text-600 font-bold">
                      {application?.instances?.items?.length || '–'}/{application?.max_running_instances || '-'}
                    </span>
                  </Skeleton>
                  <span className="flex text-xs text-zinc-350 font-medium">
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
                  <span className="flex text-xs text-zinc-350 font-medium">
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
            </>
          ) : (
            <JobOverview application={application as JobApplicationEntity} />
          )}
        </div>
        <div className="bg-white rounded-b flex flex-col justify-end">
          <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
        </div>
      </div>
      <div className="w-right-help-sidebar py-10 border-l border-element-light-lighter-400">
        <About description={application?.description || ''} />

        {application &&
          (isApplication(application) ? (
            <AboutGit application={application} />
          ) : isJob(application) ? (
            isGitJob(application) ? (
              <AboutGit application={application} />
            ) : (
              <AboutContainer
                loadingStatus={loadingStatus}
                organizationId={organizationId}
                currentRegistry={props.currentRegistry}
                container={application}
              />
            )
          ) : (
            <AboutContainer
              loadingStatus={loadingStatus}
              organizationId={organizationId}
              container={application}
              currentRegistry={props.currentRegistry}
            />
          ))}

        <AboutUpdate application={application} />
      </div>
    </div>
  )
}

export default PageGeneral
