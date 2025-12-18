import { type GitProviderEnum } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import {
  GitBranchSettings,
  GitProviderSetting,
  GitPublicRepositorySettings,
  GitRepositorySetting,
  GitTokenCreateEditModal,
  isGitTokenExpired,
  useGitTokens,
} from '@qovery/domains/organizations/feature'
import { Button, Callout, Icon, useModal } from '@qovery/shared/ui'
import ConfirmationGitModal from '../confirmation-git-modal/confirmation-git-modal'

export interface GitRepositorySettingsProps {
  gitDisabled: boolean
  currentProvider?: string
  currentRepository?: string
  editGitSettings?: () => void
  rootPathLabel?: string
  rootPathHint?: string
  urlRepository?: string
  organizationId: string
}

export function GitRepositorySettings({
  gitDisabled,
  editGitSettings,
  currentRepository,
  currentProvider,
  rootPathLabel,
  rootPathHint,
  urlRepository,
  organizationId,
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

  const { data: gitTokens = [] } = useGitTokens({ organizationId })
  const selectedToken = gitTokens.find((t) => t.id === watchFieldGitTokenId)

  return (
    <div className="flex flex-col gap-4">
      <GitProviderSetting disabled={gitDisabled} />
      {selectedToken && isGitTokenExpired(selectedToken) && (
        <Callout.Root color="yellow" className="items-center">
          <Callout.Icon>
            <Icon iconName="triangle-exclamation" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text className="flex-1">
            The selected git token has expired. Please update it to ensure deployments work correctly.
          </Callout.Text>
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() => {
              openModal({
                content: (
                  <GitTokenCreateEditModal
                    isEdit
                    gitToken={selectedToken}
                    organizationId={organizationId}
                    onClose={(response) => {
                      closeModal()
                      // Token was updated, form will re-validate automatically via React Query
                    }}
                  />
                ),
              })
            }}
          >
            Update now
          </Button>
        </Callout.Root>
      )}
      {watchFieldIsPublicRepository ? (
        <>
          <GitPublicRepositorySettings urlRepository={urlRepository} disabled={gitDisabled} />
          <Callout.Root color="sky" className="items-center">
            <Callout.Icon>
              <Icon iconName="info-circle" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              Git automations are disabled when using public repos (auto-deploy, automatic preview environments)
            </Callout.Text>
          </Callout.Root>
        </>
      ) : (
        <>
          {watchFieldProvider && (
            <GitRepositorySetting
              disabled={gitDisabled}
              gitProvider={watchFieldProvider}
              gitTokenId={watchFieldGitTokenId}
              urlRepository={urlRepository}
            />
          )}
          {watchFieldProvider && watchFieldRepository && (
            <GitBranchSettings
              disabled={gitDisabled}
              gitProvider={watchFieldProvider}
              gitTokenId={watchFieldGitTokenId}
              rootPathLabel={rootPathLabel}
              rootPathHint={rootPathHint}
            />
          )}
        </>
      )}
      {gitDisabled && editGitSettings && currentProvider && currentRepository && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="surface"
            size="md"
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
            <Icon iconName="triangle-exclamation" className="ml-2 text-sm text-yellow-500" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default GitRepositorySettings
