import { type GitProviderEnum } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import { GitBranchSetting, GitProviderSetting, GitRepositorySetting } from '@qovery/domains/organizations/feature'
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
    provider: string
    repository: string
    branch: string
    root_path: string
  }>()
  const { openModal, closeModal } = useModal()

  const watchFieldProvider = watch('provider') as GitProviderEnum
  const watchFieldRepository = watch('repository')

  const children = (
    <div className="flex flex-col gap-3">
      <GitProviderSetting disabled={gitDisabled} />
      {watchFieldProvider && <GitRepositorySetting disabled={gitDisabled} gitProvider={watchFieldProvider} />}
      {watchFieldProvider && watchFieldRepository && (
        <GitBranchSetting disabled={gitDisabled} gitProvider={watchFieldProvider} />
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
