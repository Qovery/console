import { type Environment } from 'qovery-typescript-axios'
import { P, match } from 'ts-pattern'
import { type OutdatedService } from '@qovery/domains/services/feature'
import { ServiceTypeEnum, isJobGitSource } from '@qovery/shared/enums'
import {
  Avatar,
  AvatarStyle,
  ButtonLegacy,
  ButtonLegacySize,
  ButtonLegacyStyle,
  Icon,
  IconAwesomeEnum,
  InputCheckbox,
  LoaderSpinner,
  ScrollShadowWrapper,
  TagCommit,
  Truncate,
} from '@qovery/shared/ui'

export interface UpdateAllModalProps {
  services: OutdatedService[]
  environment?: Environment
  closeModal?: () => void
  submitDisabled?: boolean
  onSubmit?: () => void
  submitLoading?: boolean
  checkService: (serviceId: string) => void
  selectedServiceIds: string[]
  unselectAll: () => void
  selectAll: () => void
  listLoading?: boolean
  getAvatarForCommit: (service: OutdatedService, commitId?: string) => string | undefined
  getNameForCommit: (service: OutdatedService, commitId?: string) => string | undefined
}

export function UpdateAllModal({
  services,
  selectedServiceIds,
  environment,
  selectAll,
  unselectAll,
  submitDisabled,
  submitLoading,
  onSubmit,
  listLoading,
  closeModal,
  checkService,
  getNameForCommit,
  getAvatarForCommit,
}: UpdateAllModalProps) {
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

        {services.length > 0 &&
          (selectedServiceIds.length > 0 ? (
            <ButtonLegacy
              onClick={unselectAll}
              dataTestId="deselect-all"
              size={ButtonLegacySize.TINY}
              style={ButtonLegacyStyle.STROKED}
            >
              Deselect All
            </ButtonLegacy>
          ) : (
            <ButtonLegacy
              onClick={selectAll}
              dataTestId="select-all"
              size={ButtonLegacySize.TINY}
              style={ButtonLegacyStyle.STROKED}
            >
              Select All
            </ButtonLegacy>
          ))}
      </div>
      {listLoading ? (
        <LoaderSpinner className="mx-auto block" />
      ) : services.length ? (
        <ScrollShadowWrapper className="max-h-[440px]">
          <ul>
            {services.map((application, index) => {
              const gitRepository = match(application)
                .with({ serviceType: ServiceTypeEnum.APPLICATION }, ({ git_repository }) => git_repository)
                .with(
                  { serviceType: ServiceTypeEnum.JOB, source: P.when(isJobGitSource) },
                  ({ source }) => source.docker?.git_repository
                )
                .otherwise(() => undefined)

              return (
                <li
                  data-testid="outdated-service-row"
                  onClick={() => checkService(application.id)}
                  key={application.id}
                  className={`${index === 0 ? 'rounded-t' : ''} ${
                    services.length - 1 === index ? 'rounded-b !border-b' : ''
                  } border border-b-0  p-4 flex justify-between ${
                    isChecked(application.id) ? `bg-brand-50 border border-brand-500` : 'border-neutral-250'
                  } ${services && isChecked(services[index - 1]?.id) && 'border-t-brand-500'}`}
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
                    <Icon name={IconAwesomeEnum.ARROW_LEFT} className="-scale-100 text-neutral-400 mx-2" />
                    {application.commits && (
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
          <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-neutral-350" />
          <p className="text-neutral-350 font-medium text-xs mt-1">No outdated services found</p>
        </div>
      )}

      <div className="flex gap-3 justify-end -mb-6 py-6 bg-white sticky bottom-0">
        <ButtonLegacy
          dataTestId="cancel-button"
          className="btn--no-min-w"
          style={ButtonLegacyStyle.STROKED}
          size={ButtonLegacySize.XLARGE}
          onClick={closeModal}
        >
          Cancel
        </ButtonLegacy>
        <ButtonLegacy
          dataTestId="submit-button"
          disabled={selectedServiceIds.length === 0 || submitDisabled}
          className="btn--no-min-w"
          type="submit"
          size={ButtonLegacySize.XLARGE}
          onClick={onSubmit}
          loading={submitLoading}
        >
          Update {selectedServiceIds.length} service{selectedServiceIds.length > 1 ? 's' : ''}
        </ButtonLegacy>
      </div>
    </div>
  )
}

export default UpdateAllModal
