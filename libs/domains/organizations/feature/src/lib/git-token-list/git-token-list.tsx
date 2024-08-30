import { useParams } from 'react-router-dom'
import {
  BlockContent,
  Button,
  Icon,
  LoaderSpinner,
  Tooltip,
  Truncate,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { dateMediumLocalFormat, dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import GitTokenCreateEditModal from '../git-token-create-edit-modal/git-token-create-edit-modal'
import GitTokenServicesListModal from '../git-token-services-list-modal/git-token-services-list-modal'
import { useDeleteGitToken } from '../hooks/use-delete-git-token/use-delete-git-token'
import { useGitTokens } from '../hooks/use-git-tokens/use-git-tokens'

export function GitTokenList() {
  const { organizationId = '' } = useParams()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { data: gitTokens = [], isFetched: isFetchedGitTokens } = useGitTokens({ organizationId })
  const { mutate: deleteToken } = useDeleteGitToken()

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
              className="flex items-center justify-between border-b border-neutral-250 px-5 py-4 last:border-0"
            >
              <div className="flex">
                <Icon name={gitToken.type} width="20px" height="20px" />
                <div className="ml-4">
                  <p className="mb-1 flex text-xs font-medium text-neutral-400">
                    <Truncate truncateLimit={60} text={gitToken.name ?? ''} />
                    {gitToken.description && (
                      <Tooltip content={gitToken.description}>
                        <span className="ml-1 cursor-pointer">
                          <Icon iconName="circle-info" iconStyle="regular" className="ml-1 cursor-pointer" />
                        </span>
                      </Tooltip>
                    )}
                  </p>
                  <p className="text-xs text-neutral-350">
                    {gitToken.updated_at && (
                      <span className="inline-block" title={dateUTCString(gitToken.updated_at)}>
                        Last updated {timeAgo(new Date(gitToken.updated_at))}
                      </span>
                    )}

                    {gitToken.created_at && (
                      <span className="ml-3 inline-block" title={dateUTCString(gitToken.created_at)}>
                        Created since {dateMediumLocalFormat(gitToken.created_at)}
                      </span>
                    )}
                    {gitToken.expired_at && (
                      <span className="ml-3 inline-block" title={dateUTCString(gitToken.expired_at)}>
                        Expiration: {dateMediumLocalFormat(gitToken.expired_at)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div>
                <Button
                  variant="surface"
                  color="neutral"
                  size="md"
                  className="relative mr-2"
                  disabled={gitToken.associated_services_count === 0}
                  onClick={() => {
                    openModal({
                      content: (
                        <GitTokenServicesListModal
                          organizationId={organizationId}
                          gitTokenId={gitToken.id}
                          onClose={closeModal}
                          associatedServicesCount={gitToken.associated_services_count}
                        />
                      ),
                    })
                  }}
                >
                  <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-brand-500 text-3xs font-bold leading-[0] text-white">
                    {gitToken.associated_services_count}
                  </span>
                  <Icon iconName="layer-group" iconStyle="regular" />
                </Button>
                <Button
                  variant="surface"
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
                  <Icon iconName="gear" iconStyle="regular" />
                </Button>
                <Button
                  variant="surface"
                  color="neutral"
                  size="md"
                  onClick={() => {
                    openModalConfirmation({
                      title: 'Delete git token',
                      description: (
                        <p>
                          Token deletion is allowed only if no services are using it. <br />
                          To confirm the deletion of <strong>{gitToken?.name}</strong>, please type "delete"
                        </p>
                      ),
                      isDelete: true,
                      name: gitToken?.name,
                      action: () => deleteToken({ organizationId, gitTokenId: gitToken.id }),
                    })
                  }}
                >
                  <Icon iconName="trash-can" iconStyle="regular" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-5 py-4 text-center">
          <Icon iconName="wave-pulse" className="text-neutral-350" />
          <p className="mt-1 text-xs font-medium text-neutral-350">
            No Git Tokens found. <br /> Please add one.
          </p>
        </div>
      )}
    </BlockContent>
  )
}

export default GitTokenList
