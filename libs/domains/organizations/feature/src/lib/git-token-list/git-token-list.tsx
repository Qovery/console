import { useParams } from 'react-router-dom'
import {
  BlockContent,
  Button,
  Icon,
  IconAwesomeEnum,
  LoaderSpinner,
  Tooltip,
  Truncate,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond, timeAgo } from '@qovery/shared/util-dates'
import GitTokenCreateEditModal from '../git-token-create-edit-modal/git-token-create-edit-modal'
import { useDeleteGitToken } from '../hooks/use-delete-git-token/use-delete-git-token'
import { useGitTokens } from '../hooks/use-git-tokens/use-git-tokens'

export function GitTokenList() {
  const { organizationId = '' } = useParams()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { data: gitTokens = [], isFetched: isFetchedGitTokens } = useGitTokens({ organizationId })
  const { mutate: deleteToken } = useDeleteGitToken({ organizationId })

  return (
    <BlockContent title="Git tokens" classNameContent="p-0">
      {!isFetchedGitTokens ? (
        <div className="flex justify-center p-5">
          <LoaderSpinner className="w-5" />
        </div>
      ) : gitTokens.length > 0 ? (
        <ul>
          {gitTokens?.map((gitToken) => (
            <li
              key={gitToken.id}
              className="flex justify-between items-center px-5 py-4 border-b border-neutral-250 last:border-0"
            >
              <div className="flex">
                <Icon name={gitToken.type} width="20px" height="20px" />
                <div className="ml-4">
                  <p className="flex text-xs text-neutral-400 font-medium mb-1">
                    <Truncate truncateLimit={60} text={gitToken.name ?? ''} />
                    {gitToken.description && (
                      <Tooltip content={gitToken.description}>
                        <div className="ml-1 cursor-pointer">
                          <Icon name={IconAwesomeEnum.CIRCLE_INFO} className="text-neutral-350" />
                        </div>
                      </Tooltip>
                    )}
                  </p>
                  <p className="text-xs text-neutral-350">
                    <span className="inline-block">Last updated {timeAgo(new Date(gitToken.updated_at ?? ''))}</span>
                    <span className="inline-block ml-3">
                      Created since {dateYearMonthDayHourMinuteSecond(new Date(gitToken.created_at ?? ''), false)}
                    </span>
                    {gitToken.expired_at && (
                      <span className="inline-block ml-3">
                        Expiration: {dateYearMonthDayHourMinuteSecond(new Date(gitToken.expired_at ?? ''), false)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div>
                <Button
                  variant="outline"
                  color="neutral"
                  size="md"
                  className="mr-2"
                  onClick={() => {
                    openModal({
                      content: (
                        <GitTokenCreateEditModal
                          isEdit
                          gitToken={gitToken}
                          organizationId={organizationId}
                          onClose={closeModal}
                        />
                      ),
                    })
                  }}
                >
                  <Icon name={IconAwesomeEnum.WHEEL} />
                </Button>
                <Button
                  variant="outline"
                  color="neutral"
                  size="md"
                  onClick={() => {
                    openModalConfirmation({
                      title: 'Delete git token',
                      isDelete: true,
                      name: gitToken?.name,
                      action: () => deleteToken({ organizationId, gitTokenId: gitToken.id }),
                    })
                  }}
                >
                  <Icon name={IconAwesomeEnum.TRASH} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-4 px-5">
          <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-neutral-350" />
          <p className="text-neutral-350 font-medium text-xs mt-1">
            No Git Tokens found. <br /> Please add one.
          </p>
        </div>
      )}
    </BlockContent>
  )
}

export default GitTokenList
