import { BuildModeEnum, BuildPackLanguageEnum } from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { GitRepositorySettingsFeature } from '@qovery/shared/console-shared'
import { IconEnum, ServiceTypeEnum } from '@qovery/shared/enums'
import { Button, ButtonSize, ButtonStyle, InputSelect, InputText, Link } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/utils'
import { GlobalData } from '../../../feature/page-application-create-feature/interfaces.interface'

export interface PageApplicationCreateGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function PageApplicationCreateGeneral(props: PageApplicationCreateGeneralProps) {
  const { control, getValues, watch, formState } = useFormContext<GlobalData>()
  watch('applicationSource')
  const watchBuildMode = watch('build_mode')

  const buildModeItems = Object.values(BuildModeEnum).map((value) => ({
    label: upperCaseFirstLetter(value) || '',
    value: value,
  }))

  const languageItems = Object.values(BuildPackLanguageEnum).map((value) => ({
    label: upperCaseFirstLetter(value) || '',
    value: value,
  }))

  watch((data) => {
    console.log(data)
  })

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">Application General Data</h3>
        <p className="text-text-500 text-sm mb-2">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cupiditate dignissimos earum fugiat fugit impedit in
          ipsa natus, quam sunt voluptate. Amet animi cupiditate, dignissimos eos excepturi maiores praesentium vero
          voluptates!
        </p>
        <Link link="#" linkLabel="link" external={true} />
      </div>

      <form onSubmit={props.onSubmit}>
        <Controller
          name="name"
          control={control}
          rules={{
            required: 'Value required',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
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
          name="applicationSource"
          control={control}
          rules={{
            required: 'Please select a source.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              className="mb-6"
              onChange={field.onChange}
              value={field.value}
              options={[
                { value: ServiceTypeEnum.APPLICATION, label: 'Git provider', icon: IconEnum.GITHUB },
                { value: ServiceTypeEnum.CONTAINER, label: 'Container Registry', icon: IconEnum.GITHUB },
              ]}
              label="Application source"
              error={error?.message}
            />
          )}
        />

        <div className="border-b border-b-element-light-lighter-400 mb-6"></div>
        {getValues().applicationSource === ServiceTypeEnum.APPLICATION && (
          <>
            <div className="mb-6">
              <GitRepositorySettingsFeature inBlock={false} />
            </div>

            <div className="border-b border-b-element-light-lighter-400 mb-6"></div>

            <div className="mb-6">
              <Controller
                name="build_mode"
                control={control}
                rules={{
                  required: 'Please select a mode.',
                }}
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

              {watchBuildMode === BuildModeEnum.DOCKER && (
                <Controller
                  key="dockerfile_path"
                  name="dockerfile_path"
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
        )}

        {getValues().applicationSource === ServiceTypeEnum.CONTAINER && (
          <div>
            <p className="mb-3 text-sm text-text-500">
              For Applications created from a Registry, fill the informations below
            </p>
            <Controller
              name="registry"
              control={control}
              rules={{
                required: 'Please select a source.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  className="mb-6"
                  onChange={field.onChange}
                  value={field.value}
                  options={[
                    { value: ServiceTypeEnum.APPLICATION, label: 'Git provider', icon: IconEnum.GITHUB },
                    { value: ServiceTypeEnum.CONTAINER, label: 'Container Registry', icon: IconEnum.GITHUB },
                  ]}
                  label="Application source"
                  error={error?.message}
                />
              )}
            />
          </div>
        )}

        <div className="flex justify-between">
          <Button type="button" size={ButtonSize.XLARGE} style={ButtonStyle.STROKED}>
            Cancel
          </Button>
          <Button type="submit" disabled={!formState.isValid} size={ButtonSize.XLARGE} style={ButtonStyle.BASIC}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PageApplicationCreateGeneral
