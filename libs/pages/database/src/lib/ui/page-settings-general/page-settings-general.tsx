import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import {
  BlockContent,
  Button,
  ButtonSize,
  ButtonStyle,
  HelpSection,
  Icon,
  InputSelect,
  InputText,
  InputTextArea,
  Link,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/utils'

export interface PageSettingsGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loading?: boolean
}

const databasesType = Object.values(DatabaseTypeEnum).map((value) => ({
  label: upperCaseFirstLetter(value) || '',
  value: value,
  icon: <Icon width="16px" height="16px" name={value} />,
}))

const databasesMode = Object.values(DatabaseModeEnum).map((value) => ({
  label: upperCaseFirstLetter(value) || '',
  value: value,
}))

const databasesAccessibility = Object.values(DatabaseAccessibilityEnum).map((value) => ({
  label: upperCaseFirstLetter(value) || '',
  value: value,
}))

export function PageSettingsGeneral(props: PageSettingsGeneralProps) {
  const { onSubmit, loading } = props
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
                  className="mb-3"
                  dataTestId="input-name"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Database name"
                  error={error?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <InputTextArea
                  className="mb-3"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Description"
                />
              )}
            />
            <Controller
              name="type"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  className="mb-3"
                  label="Type"
                  options={databasesType}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  disabled
                />
              )}
            />
            <Controller
              name="mode"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div className="mb-3">
                  <InputSelect
                    label="Mode"
                    options={databasesMode}
                    onChange={field.onChange}
                    value={field.value}
                    error={error?.message}
                    disabled
                  />
                  <Link
                    className="!text-xs ml-4 gap-0.5"
                    link="https://hub.qovery.com/docs/using-qovery/configuration/database/#modes"
                    linkLabel="Learn more"
                    iconRight="icon-solid-arrow-up-right-from-square text-xxs"
                    external
                  />
                </div>
              )}
            />
            <Controller
              name="version"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  className="mb-3"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Version"
                  error={error?.message}
                  disabled
                />
              )}
            />
            <Controller
              name="accessibility"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState: { error } }) => (
                <>
                  <InputSelect
                    dataTestId="input-select-accessibility"
                    label="Accessibility"
                    options={databasesAccessibility}
                    onChange={field.onChange}
                    value={field.value}
                    error={error?.message}
                  />
                  <Link
                    className="!text-xs ml-4 gap-0.5"
                    link="https://hub.qovery.com/docs/using-qovery/configuration/database/#accessibility"
                    linkLabel="Learn more"
                    iconRight="icon-solid-arrow-up-right-from-square text-xxs"
                    external
                  />
                </>
              )}
            />
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
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/database',
            linkLabel: 'How to configure my database',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsGeneral
