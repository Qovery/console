import { type Commit, type DeployAllRequest, type Environment } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { P, match } from 'ts-pattern'
import { isJobGitSource } from '@qovery/shared/enums'
import {
  Button,
  Icon,
  InputCheckbox,
  LegacyAvatar,
  LegacyAvatarStyle,
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

      const servicesDictionary = outdatedServices.reduce(
        (acc, service) => {
          acc[service.id] = service
          return acc
        },
        {} as Record<string, OutdatedService>
      )

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
      <h2 className="h4 mb-1 max-w-sm truncate text-neutral-400 dark:text-neutral-50">Deploy latest version for..</h2>
      <p className="mb-4 text-sm text-neutral-350 dark:text-neutral-50">
        Select the services you want to update to the latest version
      </p>

      <div className="mb-4 flex items-center justify-between text-sm text-neutral-400 dark:text-neutral-50">
        <p>
          For{' '}
          <strong className="font-medium">
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
                  } flex justify-between border border-b-0 p-4 dark:border-neutral-400 ${
                    isChecked(application.id)
                      ? `border border-brand-500 bg-brand-50 dark:bg-neutral-500`
                      : 'border-neutral-250'
                  } ${outdatedServices && isChecked(outdatedServices[index - 1]?.id) && 'border-t-brand-500'}`}
                >
                  <div className="flex font-medium text-neutral-400 dark:text-neutral-50">
                    <InputCheckbox
                      name={application.id}
                      value={application.id}
                      isChecked={isChecked(application.id)}
                      className="mr-4"
                    />
                    <Truncate truncateLimit={31} text={application.name} />
                  </div>
                  <div className="ml-auto flex items-center">
                    <div
                      data-testid="current-commit-block"
                      className={`flex items-center ${isChecked(application.id) ? 'opacity-50' : ''}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {}
                      <LegacyAvatar
                        size={28}
                        className="mr-2"
                        style={LegacyAvatarStyle.STROKED}
                        firstName={getNameForCommit(application, gitRepository?.deployed_commit_id) || 'Unknown'}
                        url={getAvatarForCommit(application, gitRepository?.deployed_commit_id)}
                      />
                      <TagCommit withBackground commitId={gitRepository?.deployed_commit_id} />
                    </div>
                    <Icon iconName="arrow-left" className="mx-2 -scale-100 text-neutral-400" />
                    {application.commits && Boolean(application.commits.length) && (
                      <div
                        data-testid="last-commit-block"
                        className={`flex items-center ${!isChecked(application.id) ? 'opacity-50' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LegacyAvatar
                          size={28}
                          className="mr-2"
                          style={LegacyAvatarStyle.STROKED}
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
        <div className="px-3 py-6 text-center" data-testid="empty-state">
          <Icon iconName="wave-pulse" className="text-neutral-350" />
          <p className="mt-1 text-xs font-medium text-neutral-350">No outdated services found</p>
        </div>
      )}

      <div className="sticky bottom-0 -mb-6 flex justify-end gap-3 bg-white py-6 dark:bg-neutral-550">
        <Button data-testid="cancel-button" color="neutral" variant="plain" size="lg" onClick={closeModal}>
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
