import { BuildModeEnum, BuildPackLanguageEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { BlockContent, Button, HelpSection, InputSelect, InputText } from '@console/shared/ui'
import { upperCaseFirstLetter } from '@console/shared/utils'

export interface PageSettingsGeneralProps {
  onSubmit: () => void
}

export const buildModeItems = Object.values(BuildModeEnum).map((value) => ({
  label: upperCaseFirstLetter(value) || '',
  value: value,
}))

export const languageItems = Object.values(BuildPackLanguageEnum).map((value) => ({
  label: upperCaseFirstLetter(value) || '',
  value: value,
}))

export function PageSettingsGeneral(props: PageSettingsGeneralProps) {
  const { onSubmit } = props

  const { control, formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8">
        <h2 className="h5 mb-8 text-text-700">General settings</h2>
        <form onSubmit={onSubmit}>
          <BlockContent title="General informations">
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Please enter a name.' }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Application name"
                  error={error?.message}
                />
              )}
            />
          </BlockContent>
          <BlockContent title="Build mode">
            <Controller
              name="buildmode"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  label="Mode"
                  items={buildModeItems}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                />
              )}
            />
            <Controller
              name="language"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  label="Language framework"
                  items={languageItems}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                />
              )}
            />
            <Controller
              name="dockerfile_path"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Dockerfile path"
                  error={error?.message}
                />
              )}
            />
          </BlockContent>
          <div className="flex justify-end">
            <Button className="btn--no-min-w" type="submit" disabled={!formState.isValid}>
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
