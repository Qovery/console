import { BuildModeEnum, BuildPackLanguageEnum } from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import {
  EditGitRepositorySettingsFeature,
  EntrypointCmdInputs,
  GeneralContainerSettings,
  JobGeneralSettings,
} from '@qovery/shared/console-shared'
import { ServiceTypeEnum, isApplication, isContainer, isCronJob, isJob } from '@qovery/shared/enums'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonSize,
  ButtonStyle,
  HelpSection,
  InputSelect,
  InputText,
  InputTextArea,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/utils'

export interface PageSettingsGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  watchBuildMode: BuildModeEnum
  type?: ServiceTypeEnum
  loading?: boolean
  organization?: OrganizationEntity
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
  const { onSubmit, watchBuildMode, type, loading } = props
  const { control, formState } = useFormContext()

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
                  className="mb-3"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Application name"
                  error={error?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <InputTextArea name={field.name} onChange={field.onChange} value={field.value} label="Description" />
              )}
            />
          </BlockContent>
          {isJob(type) && (
            <JobGeneralSettings
              isEdition={true}
              jobType={isCronJob(type) ? ServiceTypeEnum.CRON_JOB : ServiceTypeEnum.LIFECYCLE_JOB}
              organization={props.organization}
            />
          )}
          {isContainer(type) && (
            <BlockContent title="Container settings">
              <GeneralContainerSettings organization={props.organization} />
              <EntrypointCmdInputs />
            </BlockContent>
          )}
          {isApplication(type) && (
            <>
              <EditGitRepositorySettingsFeature />
              <BlockContent title="Build mode">
                <Controller
                  name="build_mode"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelect
                      dataTestId="input-select-mode"
                      label="Mode"
                      className="mb-3"
                      options={buildModeItems}
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
                        options={languageItems}
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
            </>
          )}
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
