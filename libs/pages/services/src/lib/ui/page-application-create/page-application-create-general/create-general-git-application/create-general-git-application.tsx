import { BuildModeEnum, BuildPackLanguageEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { GitRepositorySettingsFeature } from '@qovery/shared/console-shared'
import { InputSelect, InputText } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/utils'
import { GeneralData } from '../../../../feature/page-application-create-feature/application-creation-flow.interface'

export function CreateGeneralGitApplication() {
  const { control, watch } = useFormContext<GeneralData>()
  const watchBuildMode = watch('build_mode')

  const buildModeItems = Object.values(BuildModeEnum).map((value) => ({
    label: upperCaseFirstLetter(value) || '',
    value: value,
  }))

  const languageItems = Object.values(BuildPackLanguageEnum).map((value) => ({
    label: upperCaseFirstLetter(value) || '',
    value: value,
  }))

  return (
    <>
      <p className="mb-3 text-sm text-text-500">
        For Applications created from a Git Provider, fill the informations below
      </p>
      <div className="mb-6">
        <GitRepositorySettingsFeature withBlockWrapper={false} />
      </div>

      <div className="border-b border-b-element-light-lighter-400 mb-6"></div>

      <div className="mb-6">
        <Controller
          name="build_mode"
          control={control}
          rules={{
            required: 'Please select a mode.',
          }}
          defaultValue={'DOCKER'}
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
        {watchBuildMode === BuildModeEnum.BUILDPACKS && (
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
        )}

        {(!watchBuildMode || watchBuildMode === BuildModeEnum.DOCKER) && (
          <Controller
            data-testid="input-text-dockerfile-path"
            key="dockerfile_path"
            name="dockerfile_path"
            defaultValue={'Dockefile'}
            control={control}
            rules={{
              required: 'Value required',
            }}
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
      </div>
    </>
  )
}

export default CreateGeneralGitApplication
