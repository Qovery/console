import { BuildModeEnum, BuildPackLanguageEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { AutoDeploySetting } from '@qovery/domains/services/feature'
import {
  EditGitRepositorySettingsFeature,
  EntrypointCmdInputs,
  GeneralContainerSettings,
  JobGeneralSettings,
} from '@qovery/shared/console-shared'
import { ServiceTypeEnum, isApplication, isContainer, isCronJob, isJob } from '@qovery/shared/enums'
import { type OrganizationEntity } from '@qovery/shared/interfaces'
import {
  BlockContent,
  ButtonLegacy,
  ButtonLegacySize,
  ButtonLegacyStyle,
  HelpSection,
  InputSelect,
  InputText,
  InputTextArea,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

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

export function PageSettingsGeneral({
  onSubmit,
  watchBuildMode,
  type,
  loading,
  organization,
}: PageSettingsGeneralProps) {
  const { control, formState, watch } = useFormContext()
  const watchServiceType = watch('serviceType')

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 mb-8 text-neutral-400">General settings</h2>
        <form onSubmit={onSubmit}>
          <BlockContent title="General information">
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
            <>
              <JobGeneralSettings
                isEdition={true}
                jobType={isCronJob(type) ? ServiceTypeEnum.CRON_JOB : ServiceTypeEnum.LIFECYCLE_JOB}
                organization={organization}
              />
              <BlockContent title="Auto-deploy">
                <AutoDeploySetting
                  source={watchServiceType === ServiceTypeEnum.CONTAINER ? 'CONTAINER_REGISTRY' : 'GIT'}
                />
              </BlockContent>
            </>
          )}
          {isApplication(type) && (
            <>
              <EditGitRepositorySettingsFeature />
              <BlockContent classNameContent="gap-3 flex flex-col" title="Build & deploy">
                <Controller
                  name="build_mode"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelect
                      dataTestId="input-select-mode"
                      label="Mode"
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

              {watchBuildMode === BuildModeEnum.DOCKER && (
                <BlockContent title="Entrypoint and arguments">
                  <EntrypointCmdInputs />
                </BlockContent>
              )}

              <BlockContent title="Auto-deploy">
                <AutoDeploySetting source="GIT" />
              </BlockContent>
            </>
          )}

          {isContainer(type) && (
            <>
              <BlockContent title="Container Settings">
                <GeneralContainerSettings organization={organization} />
              </BlockContent>
              <BlockContent title="Entrypoint and arguments">
                <EntrypointCmdInputs />
              </BlockContent>
              <BlockContent title="Auto-deploy">
                <AutoDeploySetting source="CONTAINER_REGISTRY" />
              </BlockContent>
            </>
          )}

          <div className="flex justify-end">
            <ButtonLegacy
              dataTestId="submit-button"
              className="btn--no-min-w"
              size={ButtonLegacySize.LARGE}
              style={ButtonLegacyStyle.BASIC}
              type="submit"
              disabled={!formState.isValid}
              loading={loading}
            >
              Save
            </ButtonLegacy>
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
