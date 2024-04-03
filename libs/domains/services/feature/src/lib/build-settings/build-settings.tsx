import { BuildModeEnum, BuildPackLanguageEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { type ApplicationGeneralData } from '@qovery/shared/interfaces'
import { Icon, InputSelect, InputText } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface BuildSettingsProps {
  buildModeDisabled?: boolean
}

export function BuildSettings({ buildModeDisabled = false }: BuildSettingsProps) {
  const { control, watch } = useFormContext<ApplicationGeneralData>()
  const watchBuildMode = watch('build_mode')

  const buildModeItems = Object.values(BuildModeEnum).map((value) => ({
    label: upperCaseFirstLetter(value),
    value: value,
    icon: <Icon name={value} className="w-4" />,
  }))

  const languageItems = Object.values(BuildPackLanguageEnum).map((value) => ({
    label: upperCaseFirstLetter(value),
    value: value,
  }))

  return (
    <>
      <Controller
        name="build_mode"
        control={control}
        rules={{
          required: 'Please select a mode.',
        }}
        defaultValue="DOCKER"
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            dataTestId="input-select-mode"
            label="Mode"
            disabled={buildModeDisabled}
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
          defaultValue="Dockerfile"
          control={control}
          rules={{
            required: 'Value required',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              dataTestId="input-text-dockerfile"
              name={field.name}
              onChange={field.onChange}
              value={field.value ?? ''}
              label="Dockerfile path"
              error={error?.message}
            />
          )}
        />
      )}
    </>
  )
}

export default BuildSettings
