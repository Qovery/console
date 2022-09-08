import { Controller, useFormContext } from 'react-hook-form'
import { LoadingStatus, Value } from '@console/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonSize,
  ButtonStyle,
  IconAwesomeEnum,
  InputSelect,
  InputText,
  LoaderSpinner,
  useModal,
} from '@console/shared/ui'
import ConfirmationGitModal from './confirmation-git-modal/confirmation-git-modal'

export interface GitRepositorySettingsProps {
  gitDisabled: boolean
  editGitSettings: () => void
  authProviders?: Value[]
  repositories?: Value[]
  branches?: Value[]
  loadingStatusAuthProviders?: LoadingStatus
  loadingStatusRepositories?: LoadingStatus
  loadingStatusBranches?: LoadingStatus
  currentAuthProvider?: string
}

export function GitRepositorySettings(props: GitRepositorySettingsProps) {
  const {
    gitDisabled,
    editGitSettings,
    authProviders = [],
    currentAuthProvider,
    repositories = [],
    loadingStatusRepositories,
    loadingStatusAuthProviders,
    loadingStatusBranches,
    branches = [],
  } = props

  const { control } = useFormContext()
  const { openModal, closeModal } = useModal()

  return (
    <BlockContent title="Git repository">
      <Controller
        name="provider"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            dataTestId="input-provider"
            label="Git repository"
            className="mb-3"
            options={authProviders}
            onChange={field.onChange}
            value={field.value}
            error={error?.message}
            disabled={gitDisabled}
          />
        )}
      />
      {loadingStatusAuthProviders !== 'loading' && loadingStatusRepositories !== 'loading' ? (
        <>
          <Controller
            name="repository"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputSelect
                dataTestId="input-repository"
                label="Repository"
                className="mb-3"
                options={repositories}
                onChange={field.onChange}
                value={field.value}
                error={error?.message}
                disabled={gitDisabled}
                isSearchable
              />
            )}
          />
          {(loadingStatusBranches === 'loaded' || gitDisabled) && (
            <>
              <Controller
                name="branch"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputSelect
                    dataTestId="input-branch"
                    label="Branch"
                    className="mb-3"
                    options={branches}
                    onChange={field.onChange}
                    value={field.value}
                    error={error?.message}
                    disabled={gitDisabled}
                    isSearchable
                  />
                )}
              />
              <Controller
                name="root_path"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    dataTestId="input-root-path"
                    label="Root application path"
                    name={field.name}
                    onChange={field.onChange}
                    value={field.value}
                    error={error?.message}
                    disabled={gitDisabled}
                  />
                )}
              />
            </>
          )}
          {loadingStatusBranches === 'loading' && !gitDisabled && (
            <div data-testid="loader-branch" className="flex justify-center mt-4">
              <LoaderSpinner />
            </div>
          )}
        </>
      ) : (
        <div data-testid="loader-repository" className="flex justify-center mt-4">
          <LoaderSpinner />
        </div>
      )}
      {gitDisabled && (
        <div className="flex justify-end mt-3">
          <Button
            dataTestId="button-edit"
            className="btn--no-min-w"
            size={ButtonSize.REGULAR}
            style={ButtonStyle.STROKED}
            iconRight={IconAwesomeEnum.TRIANGLE_EXCLAMATION}
            iconRightClassName="text-warning-500 text-sm"
            onClick={() =>
              openModal({
                content: (
                  <ConfirmationGitModal
                    currentAuthProvider={currentAuthProvider}
                    onClose={closeModal}
                    onSubmit={editGitSettings}
                  />
                ),
              })
            }
          >
            Edit
          </Button>
        </div>
      )}
    </BlockContent>
  )
}

export default GitRepositorySettings
