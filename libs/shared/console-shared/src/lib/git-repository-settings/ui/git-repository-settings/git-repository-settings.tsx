import { Controller, useFormContext } from 'react-hook-form'
import { LoadingStatus, Value } from '@qovery/shared/interfaces'
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
} from '@qovery/shared/ui'
import ConfirmationGitModal from '../confirmation-git-modal/confirmation-git-modal'

export interface GitRepositorySettingsProps {
  gitDisabled: boolean
  editGitSettings?: () => void
  authProviders?: Value[]
  repositories?: Value[]
  branches?: Value[]
  loadingStatusAuthProviders?: LoadingStatus
  loadingStatusRepositories?: LoadingStatus
  loadingStatusBranches?: LoadingStatus
  currentAuthProvider?: string
  withBlockWrapper?: boolean
}

export function GitRepositorySettings(props: GitRepositorySettingsProps) {
  const {
    gitDisabled,
    editGitSettings,
    authProviders = [],
    currentAuthProvider,
    repositories = [],
    loadingStatusRepositories,
    loadingStatusBranches,
    branches = [],
    withBlockWrapper = true,
  } = props

  const { control, getValues } = useFormContext<{
    provider: string
    repository: string
    branch: string
    root_path: string
  }>()
  const { openModal, closeModal } = useModal()

  const children = (
    <>
      <Controller
        name="provider"
        control={control}
        rules={{
          required: 'Please select a provider.',
        }}
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
      <Controller
        name="repository"
        control={control}
        rules={{
          required: 'Please select a repository.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            dataTestId="input-repository"
            label="Repository"
            className={`mb-0.5 ${
              (getValues().provider && loadingStatusRepositories === 'loaded') || gitDisabled ? '' : 'hidden'
            }`}
            options={repositories}
            onChange={field.onChange}
            value={field.value}
            error={error?.message}
            disabled={gitDisabled}
            isSearchable
          />
        )}
      />
      <p className="mb-3 text-right">
        {/*todo: uncomment when github app is ready on v3*/}
        {/*<Link*/}
        {/*  className={`font-medium text-ssm ${*/}
        {/*    (getValues().provider && loadingStatusRepositories === 'loaded') || gitDisabled ? '' : 'hidden'*/}
        {/*  }`}*/}
        {/*  link="https://discuss.qovery.com"*/}
        {/*  linkLabel="Don't see your repository?"*/}
        {/*  external={true}*/}
        {/*  iconRight="icon-solid-arrow-up-right-from-square"*/}
        {/*/>*/}
      </p>

      <Controller
        name="branch"
        control={control}
        rules={{
          required: 'Please select a branch.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            dataTestId="input-branch"
            label="Branch"
            className={`mb-3 ${branches.length || loadingStatusBranches === 'loaded' || gitDisabled ? '' : 'hidden'}`}
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
        defaultValue={'/'}
        rules={{
          required: 'Value required',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="input-root-path"
            label="Root application path"
            className={`${branches.length || loadingStatusBranches === 'loaded' || gitDisabled ? '' : 'hidden'}`}
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            error={error?.message}
            disabled={gitDisabled}
          />
        )}
      />

      {(loadingStatusRepositories === 'loading' || loadingStatusBranches === 'loading') && !gitDisabled && (
        <div data-testid="loader" className="flex justify-center mt-4">
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
    </>
  )

  return withBlockWrapper ? <BlockContent title="Git repository">{children}</BlockContent> : children
}

export default GitRepositorySettings
