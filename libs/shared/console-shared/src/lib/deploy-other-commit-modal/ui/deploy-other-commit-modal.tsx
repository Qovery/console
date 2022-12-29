import { Commit } from 'qovery-typescript-axios'
import {
  Avatar,
  AvatarStyle,
  Button,
  ButtonSize,
  ButtonStyle,
  Icon,
  IconAwesomeEnum,
  InputSearch,
  LoaderSpinner,
  ScrollShadowWrapper,
  TagCommit,
  Truncate,
  useModal,
} from '@qovery/shared/ui'
import { dateToFormat, timeAgo } from '@qovery/shared/utils'

export interface DeployOtherCommitModalProps {
  commitsByDay: Record<string, Commit[]>
  isLoading: boolean
  setSelectedCommitId: (commitId: string) => void
  selectedCommitId: string | null
  currentCommitId?: string
  buttonDisabled?: boolean
  handleDeploy: () => void
  deployLoading: boolean
  onSearch: (value: string) => void
  serviceName?: string
}

export function DeployOtherCommitModal(props: DeployOtherCommitModalProps) {
  const {
    commitsByDay = {},
    setSelectedCommitId,
    selectedCommitId,
    currentCommitId,
    buttonDisabled = false,
    handleDeploy,
    deployLoading,
    onSearch,
    isLoading = false,
    serviceName = 'application service',
  } = props
  const { closeModal } = useModal()

  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 max-w-sm truncate mb-1">Deploy another version</h2>
      <p className="mb-2 text-text-400 text-sm">Select the commit you want to deploy.</p>
      <p className="mb-6 text-text-500 text-sm">
        For <strong className="font-medium">{serviceName}</strong>
      </p>

      <div className="mb-6">
        <InputSearch placeholder="Search by commit message or commit id" onChange={onSearch} />
      </div>

      {isLoading && (
        <div className="flex justify-center">
          <LoaderSpinner />
        </div>
      )}

      {!isLoading && Object.keys(commitsByDay).length > 0 && (
        <ScrollShadowWrapper className="max-h-[440px]">
          {Object.keys(commitsByDay).map((date) => (
            <div key={date} className="pl-2">
              <h3 data-testid="commit-date" className="text-sm pl-5 text-text-400 font-medium relative">
                <Icon name={IconAwesomeEnum.CODE_COMMIT} className="absolute left-0 text-text-300 -translate-x-1/2" />
                Commit{commitsByDay[date].length > 1 ? 's' : ''} on {dateToFormat(date, 'MMM dd, yyyy')}
              </h3>
              <div className="border-l border-element-light-lighter-500 pt-2">
                <div className="pl-5 pb-4">
                  <div className="flex flex-col rounded-md border border-element-light-lighter-500">
                    {commitsByDay[date].map((commit, index) => (
                      <div
                        data-testid="commit-box"
                        key={commit.git_commit_id}
                        onClick={() => setSelectedCommitId(commit.git_commit_id)}
                        className={`h-[5.5rem] flex items-center transition-all justify-between cursor-pointer px-5 border-element-light-lighter-500 ${
                          currentCommitId !== commit.git_commit_id && selectedCommitId === commit.git_commit_id
                            ? 'bg-brand-50 outline-brand-500 outline'
                            : ''
                        } ${commitsByDay[date].length - 1 === index ? '' : 'border-b'}
                        ${selectedCommitId === commit.git_commit_id ? 'z-50' : ''}
                    ${currentCommitId === commit.git_commit_id ? 'bg-green-50' : ''}
                    ${index === 0 ? 'rounded-t-md' : ''} ${
                          index === commitsByDay[date].length - 1 ? 'rounded-b-md' : ''
                        }
                    `}
                      >
                        <div className="w-full">
                          <div className="flex justify-between w-full">
                            <p className="text-text-500 font-medium mb-1.5">
                              <a
                                href={commit.commit_page_url}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-brand-500"
                              >
                                <Truncate truncateLimit={45} text={commit.message} />
                              </a>
                            </p>
                            <div className="flex items-center">
                              <Avatar
                                size={28}
                                className="mr-2"
                                style={AvatarStyle.STROKED}
                                firstName={commit.author_name}
                                url={commit.author_avatar_url}
                              />
                              <TagCommit commitId={commit.git_commit_id} />
                            </div>
                          </div>

                          <div className="flex justify-between w-full">
                            <p className="text-text-400">committed {timeAgo(new Date(commit.created_at))} ago</p>
                            <p>
                              {currentCommitId !== commit.git_commit_id &&
                                selectedCommitId === commit.git_commit_id && (
                                  <span className="text-brand-500 text-ssm font-medium">Selected version</span>
                                )}
                              {currentCommitId === commit.git_commit_id && (
                                <span className="text-green-500 text-ssm font-medium">Current version</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ScrollShadowWrapper>
      )}

      {!isLoading && Object.keys(commitsByDay).length === 0 && (
        <div className="text-center px-3 py-6">
          <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-text-400" />
          <p className="text-text-400 font-medium text-xs mt-1">No result for this search</p>
        </div>
      )}

      <div className="flex gap-3 justify-end -mb-6 py-6 bg-white sticky bottom-0">
        <Button
          dataTestId="cancel-button"
          className="btn--no-min-w"
          style={ButtonStyle.STROKED}
          size={ButtonSize.XLARGE}
          onClick={() => closeModal()}
        >
          Cancel
        </Button>
        <Button
          dataTestId="submit-button"
          disabled={buttonDisabled}
          className="btn--no-min-w"
          type="submit"
          size={ButtonSize.XLARGE}
          onClick={handleDeploy}
          loading={deployLoading}
        >
          Deploy
        </Button>
      </div>
    </div>
  )
}

export default DeployOtherCommitModal
