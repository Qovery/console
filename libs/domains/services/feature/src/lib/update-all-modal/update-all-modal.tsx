import { type Commit, type DeployAllRequest, type Environment } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { P, match } from 'ts-pattern'
import { isJobGitSource } from '@qovery/shared/enums'
import {
  Avatar,
  AvatarStyle,
  Button,
  Icon,
  IconAwesomeEnum,
  InputCheckbox,
  LoaderSpinner,
  ScrollShadowWrapper,
  TagCommit,
  Truncate,
  useModal,
} from '@qovery/shared/ui'
import { useDeployAllServices } from '../hooks/use-deploy-all-services/use-deploy-all-services'
import { type OutdatedService, useOutdatedServices } from '../hooks/use-outdated-services/use-outdated-services'

export interface UpdateAllModalProps {
  environment: Environment
}

export function UpdateAllModal({ environment }: UpdateAllModalProps) {
  const { closeModal } = useModal()
  const { data: outdatedServices = [], isLoading: isOutdatedServicesLoading } = useOutdatedServices({
    environmentId: environment.id,
  })
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const { mutate: deployAllServices, isLoading: isDeployAllServicesLoading } = useDeployAllServices()

  const checkService = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== serviceId))
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId])
    }
  }

  const onSubmit = () => {
    if (selectedServiceIds.length > 0) {
      const appsToUpdate: DeployAllRequest['applications'] = []
      const jobsToUpdate: DeployAllRequest['jobs'] = []

      const servicesDictionary = outdatedServices.reduce((acc, service) => {
        acc[service.id] = service
        return acc
      }, {} as Record<string, OutdatedService>)

      selectedServiceIds.forEach((serviceId) => {
        const { serviceType, id, commits } = servicesDictionary[serviceId]
        if (serviceType === 'APPLICATION') {
          appsToUpdate.push({
            application_id: id,
            git_commit_id: commits[0]?.git_commit_id ?? '',
          })
        }

        if (serviceType === 'JOB') {
          jobsToUpdate.push({
            id,
            git_commit_id: commits[0]?.git_commit_id ?? '',
          })
        }
      })

      const deployRequest: DeployAllRequest = {
        applications: appsToUpdate,
        jobs: jobsToUpdate,
      }

      deployAllServices({ environment, payload: deployRequest })
      closeModal()
    }
  }

  const unselectAll = () => {
    setSelectedServiceIds([])
  }

  const selectAll = () => {
    setSelectedServiceIds(outdatedServices.map(({ id }) => id))
  }

  useEffect(() => {
    if (!isOutdatedServicesLoading) {
      selectAll()
    }
  }, [isOutdatedServicesLoading])

  const findCommitById = (application: OutdatedService, commitId?: string): Commit | undefined => {
    return application.commits.find((commit) => commit.git_commit_id === commitId) as Commit
  }

  const getAvatarForCommit = (application: OutdatedService, commitId?: string): string | undefined => {
    return findCommitById(application, commitId)?.author_avatar_url
  }

  const getNameForCommit = (application: OutdatedService, commitId?: string): string | undefined => {
    return findCommitById(application, commitId)?.author_name
  }
  const isChecked = (serviceId: string) => selectedServiceIds.includes(serviceId)

  return (
    <div className="p-6">
      <h2 className="h4 text-neutral-400 max-w-sm truncate mb-1">Deploy latest version for..</h2>
      <p className="mb-4 text-neutral-350 text-sm">Select the services you want to update to the latest version</p>

      <div className="text-neutral-400 text-sm mb-4 flex justify-between items-center">
        <p>
          For{' '}
          <strong className="text-neutral-400 font-medium">
            <Truncate truncateLimit={60} text={environment?.name || ''} />
          </strong>
        </p>

        {outdatedServices.length > 0 &&
          (selectedServiceIds.length > 0 ? (
            <Button onClick={unselectAll} data-testid="deselect-all" size="sm" variant="surface" color="neutral">
              Deselect All
            </Button>
          ) : (
            <Button onClick={selectAll} data-testid="select-all" size="sm" variant="surface" color="neutral">
              Select All
            </Button>
          ))}
      </div>
      {isOutdatedServicesLoading ? (
        <LoaderSpinner className="mx-auto block" />
      ) : outdatedServices.length ? (
        <ScrollShadowWrapper className="max-h-[440px]">
          <ul>
            {outdatedServices.map((application, index) => {
              const gitRepository = match(application)
                .with({ serviceType: 'APPLICATION' }, ({ git_repository }) => git_repository)
                .with(
                  { serviceType: 'JOB', source: P.when(isJobGitSource) },
                  ({ source }) => source.docker?.git_repository
                )
                .otherwise(() => undefined)

              return (
                <li
                  data-testid="outdated-service-row"
                  onClick={() => checkService(application.id)}
                  key={application.id}
                  className={`${index === 0 ? 'rounded-t' : ''} ${
                    outdatedServices.length - 1 === index ? 'rounded-b !border-b' : ''
                  } border border-b-0  p-4 flex justify-between ${
                    isChecked(application.id) ? `bg-brand-50 border border-brand-500` : 'border-neutral-250'
                  } ${outdatedServices && isChecked(outdatedServices[index - 1]?.id) && 'border-t-brand-500'}`}
                >
                  <div className="text-neutral-400 font-medium flex">
                    <InputCheckbox
                      name={application.id}
                      value={application.id}
                      isChecked={isChecked(application.id)}
                      className="mr-4"
                    />
                    <Truncate truncateLimit={31} text={application.name} />
                  </div>
                  <div className="flex ml-auto">
                    <div
                      data-testid="current-commit-block"
                      className={`flex items-center ${isChecked(application.id) ? 'opacity-50' : ''}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {}
                      <Avatar
                        size={28}
                        className="mr-2"
                        style={AvatarStyle.STROKED}
                        firstName={getNameForCommit(application, gitRepository?.deployed_commit_id) || 'Unknown'}
                        url={getAvatarForCommit(application, gitRepository?.deployed_commit_id)}
                      />
                      <TagCommit withBackground commitId={gitRepository?.deployed_commit_id} />
                    </div>
                    <Icon iconName="arrow-left" className="-scale-100 text-neutral-400 mx-2" />
                    {application.commits && Boolean(application.commits.length) && (
                      <div
                        data-testid="last-commit-block"
                        className={`flex items-center ${!isChecked(application.id) ? 'opacity-50' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Avatar
                          size={28}
                          className="mr-2"
                          style={AvatarStyle.STROKED}
                          firstName={application.commits[0].author_name || ''}
                          url={application.commits[0].author_avatar_url || ''}
                        />
                        <TagCommit withBackground commitId={application.commits[0].git_commit_id} />
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </ScrollShadowWrapper>
      ) : (
        <div className="text-center px-3 py-6" data-testid="empty-state">
          <Icon iconName="wave-pulse" className="text-neutral-350" />
          <p className="text-neutral-350 font-medium text-xs mt-1">No outdated services found</p>
        </div>
      )}

      <div className="flex gap-3 justify-end -mb-6 py-6 bg-white sticky bottom-0">
        <Button data-testid="cancel-button" variant="surface" color="neutral" size="lg" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          data-testid="submit-button"
          disabled={selectedServiceIds.length === 0}
          type="submit"
          size="lg"
          onClick={onSubmit}
          loading={isDeployAllServicesLoading}
        >
          Update {selectedServiceIds.length} service{selectedServiceIds.length > 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  )
}

export default UpdateAllModal
