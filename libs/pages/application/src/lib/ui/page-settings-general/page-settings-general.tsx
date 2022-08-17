import { BuildModeEnum, BuildPackLanguageEnum } from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Value } from '@console/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonSize,
  ButtonStyle,
  HelpSection,
  IconAwesomeEnum,
  InputSelect,
  InputText,
  useModal,
} from '@console/shared/ui'
import { upperCaseFirstLetter } from '@console/shared/utils'
import ConfirmationGitModal from './confirmation-git-modal/confirmation-git-modal'

export interface PageSettingsGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  watchBuildMode: BuildModeEnum
  gitDisabled: boolean
  setGitDisabled: (gitDisabled: boolean) => void
  authProviders?: Value[]
  repositories?: Value[]
  branches?: Value[]
  currentAuthProvider?: string
  loading?: boolean
}

const buildModeItems = Object.values(BuildModeEnum).map((value) => ({
  label: upperCaseFirstLetter(value) || '',
  value: value,
}))

const languageItems = Object.values(BuildPackLanguageEnum).map((value) => ({
  label: upperCaseFirstLetter(value) || '',
  value: value,
}))

export function PageSettingsGeneral(props: PageSettingsGeneralProps) {
  const {
    onSubmit,
    watchBuildMode,
    loading,
    gitDisabled,
    setGitDisabled,
    authProviders,
    currentAuthProvider,
    repositories,
    branches,
  } = props

  const { control, formState } = useFormContext()
  const { openModal, closeModal } = useModal()

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 mb-8 text-text-700">General settings</h2>
        <form onSubmit={onSubmit}>
          <BlockContent title="General informations">
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Please enter a name.' }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  dataTestId="input-name"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Application name"
                  error={error?.message}
                />
              )}
            />
          </BlockContent>
          <BlockContent title="Git repository">
            <Controller
              name="provider"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  dataTestId="input-provider"
                  label="Git repository"
                  className="mb-3"
                  items={authProviders || []}
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
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  dataTestId="input-repository"
                  label="Repository"
                  className="mb-3"
                  items={repositories || []}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  disabled={gitDisabled}
                  search
                />
              )}
            />
            <Controller
              name="branch"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  dataTestId="input-branch"
                  label="Branch"
                  className="mb-3"
                  items={branches || []}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  disabled={gitDisabled}
                  search
                />
              )}
            />
            <Controller
              name="root_path"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  dataTestId="input-branch"
                  label="Root application path"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  disabled={gitDisabled}
                />
              )}
            />
            <div className="flex justify-end mt-3">
              <Button
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
                        onSubmit={setGitDisabled}
                      />
                    ),
                  })
                }
              >
                Edit
              </Button>
            </div>
          </BlockContent>
          <BlockContent title="Build mode">
            <Controller
              name="build_mode"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  dataTestId="input-select-mode"
                  label="Mode"
                  className="mb-3"
                  items={buildModeItems}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                />
              )}
            />
            {watchBuildMode === BuildModeEnum.BUILDPACKS ? (
              <Controller
                key="buildpack_language"
                name="buildpack_language"
                control={control}
                rules={{
                  required: 'Please enter your buildpack language.',
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputSelect
                    dataTestId="input-select-language"
                    label="Language framework"
                    items={languageItems}
                    onChange={field.onChange}
                    value={field.value}
                    error={error?.message}
                  />
                )}
              />
            ) : (
              <Controller
                key="dockerfile_path"
                name="dockerfile_path"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    dataTestId="input-text-dockerfile"
                    name={field.name}
                    onChange={field.onChange}
                    value={field.value}
                    label="Dockerfile path"
                    error={error?.message}
                  />
                )}
              />
            )}
          </BlockContent>
          <div className="flex justify-end">
            <Button
              dataTestId="submit-button"
              className="btn--no-min-w"
              size={ButtonSize.LARGE}
              style={ButtonStyle.BASIC}
              type="submit"
              disabled={!formState.isValid}
              loading={loading}
            >
              Save
            </Button>
          </div>
        </form>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application',
            linkLabel: 'How to configure my application',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsGeneral
