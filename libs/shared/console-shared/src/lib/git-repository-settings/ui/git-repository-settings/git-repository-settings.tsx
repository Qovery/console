import { type GitProviderEnum } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import {
  GitBranchSettings,
  GitProviderSetting,
  GitPublicRepositorySettings,
  GitRepositorySetting,
} from '@qovery/domains/organizations/feature'
import {
  BlockContent,
  ButtonLegacy,
  ButtonLegacySize,
  ButtonLegacyStyle,
  IconAwesomeEnum,
  useModal,
} from '@qovery/shared/ui'
import ConfirmationGitModal from '../confirmation-git-modal/confirmation-git-modal'

export interface GitRepositorySettingsProps {
  gitDisabled: boolean
  currentProvider?: string
  currentRepository?: string
  editGitSettings?: () => void
  withBlockWrapper?: boolean
}

export function GitRepositorySettings({
  gitDisabled,
  editGitSettings,
  currentRepository,
  currentProvider,
  withBlockWrapper = true,
}: GitRepositorySettingsProps) {
  const { watch } = useFormContext<{
    provider: keyof typeof GitProviderEnum
    is_public_repository?: boolean
    repository: string
    branch: string
    root_path: string
    git_token_name: string
    git_token_id?: string
  }>()
  const { openModal, closeModal } = useModal()

  const watchFieldProvider = watch('provider')
  const watchFieldIsPublicRepository = watch('is_public_repository')
  const watchFieldRepository = watch('repository')
  const watchFieldGitTokenId = watch('git_token_id')

  const children = (
    <div className="flex flex-col gap-3">
      <GitProviderSetting disabled={gitDisabled} />
      {watchFieldIsPublicRepository ? (
        <GitPublicRepositorySettings disabled={gitDisabled} />
      ) : (
        <>
          {watchFieldProvider && (
            <GitRepositorySetting
              disabled={gitDisabled}
              gitProvider={watchFieldProvider}
              gitTokenId={watchFieldGitTokenId}
            />
          )}
          {watchFieldProvider && watchFieldRepository && (
            <GitBranchSettings
              disabled={gitDisabled}
              gitProvider={watchFieldProvider}
              gitTokenId={watchFieldGitTokenId}
            />
          )}
        </>
      )}
      {gitDisabled && editGitSettings && currentProvider && currentRepository && (
        <div className="flex justify-end">
          <ButtonLegacy
            dataTestId="button-edit"
            className="btn--no-min-w"
            size={ButtonLegacySize.REGULAR}
            style={ButtonLegacyStyle.STROKED}
            iconRight={IconAwesomeEnum.TRIANGLE_EXCLAMATION}
            iconRightClassName="text-yellow-500 text-sm"
            onClick={() =>
              openModal({
                content: (
                  <ConfirmationGitModal
                    currentProvider={currentProvider}
                    currentRepository={currentRepository}
                    onClose={closeModal}
                    onSubmit={editGitSettings}
                  />
                ),
              })
            }
          >
            Edit
          </ButtonLegacy>
        </div>
      )}
    </div>
  )

  return withBlockWrapper ? <BlockContent title="Git repository">{children}</BlockContent> : children
}

export default GitRepositorySettings
