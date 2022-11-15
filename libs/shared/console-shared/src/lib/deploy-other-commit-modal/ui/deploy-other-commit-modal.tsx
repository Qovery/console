/* eslint-disable-next-line */
import { Commit } from 'qovery-typescript-axios'
import {
  Button,
  ButtonSize,
  ButtonStyle,
  InputSearch,
  LoaderSpinner,
  TagCommit,
  Truncate,
  useModal,
} from '@qovery/shared/ui'
import { dateToFormat, timeAgo, useScrollWithShadow } from '@qovery/shared/utils'

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
  } = props
  const { closeModal } = useModal()
  const { onScrollHandler, boxShadow } = useScrollWithShadow()

  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 max-w-sm truncate mb-1">Deploy another version</h2>
      <p className="mb-6 text-text-400 text-sm">Select the commit you want to deploy.</p>

      <div className="mb-6">
        <InputSearch placeholder="Search by commit message or commit id" onChange={onSearch} />
      </div>

      {props.isLoading && (
        <div className="flex justify-center">
          <LoaderSpinner />
        </div>
      )}

      {!props.isLoading && Object.keys(commitsByDay).length > 0 && (
        <div className="h-[440px] overflow-auto" onScroll={onScrollHandler} style={{ boxShadow }}>
          {Object.keys(commitsByDay).map((date) => (
            <div key={date} className="pl-1">
              <h3 data-testid="commit-date" className="text-sm pl-4 text-text-400 font-medium">
                Commits on {dateToFormat(date, 'MMM dd, yyyy')}
              </h3>
              <div className="border-l border-element-light-lighter-600 pt-2">
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
                    ${currentCommitId === commit.git_commit_id ? 'bg-green-50' : ''}
                    ${index === 0 ? 'rounded-t-md' : ''} ${
                          index === commitsByDay[date].length - 1 ? 'rounded-b-md' : ''
                        }
                    `}
                      >
                        <div className="w-full">
                          <div className="flex justify-between w-full">
                            <p className="text-text-500 font-medium mb-1.5">
                              <a href={commit.commit_page_url} target="_blank" className="hover:text-brand-500">
                                <Truncate truncateLimit={45} text={commit.message} />
                              </a>
                            </p>
                            <TagCommit commitId={commit.git_commit_id} />
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
        </div>
      )}

      {!props.isLoading && Object.keys(commitsByDay).length === 0 && (
        <div className="flex justify-center">
          <p className="text-text-400 text-sm">No commits found</p>
        </div>
      )}

      <div className="flex gap-3 justify-end  -mb-6 py-6 bg-white sticky bottom-0">
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
