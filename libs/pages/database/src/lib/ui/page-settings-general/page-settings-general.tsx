import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import {
  BlockContent,
  ButtonLegacy,
  ButtonLegacySize,
  ButtonLegacyStyle,
  Callout,
  ExternalLink,
  HelpSection,
  Icon,
  IconAwesomeEnum,
  InputSelect,
  InputText,
  InputTextArea,
  LoaderSpinner,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface PageSettingsGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  databaseMode?: DatabaseModeEnum
  publicOptionNotAvailable?: boolean
  databaseVersionOptions?: Value[]
  databaseVersionLoading?: boolean
  loading?: boolean
}

const databasesType = Object.values(DatabaseTypeEnum).map((value) => ({
  label: upperCaseFirstLetter(value),
  value: value,
  icon: <Icon width="16px" height="16px" name={value} />,
}))

const databasesMode = Object.values(DatabaseModeEnum).map((value) => ({
  label: upperCaseFirstLetter(value),
  value: value,
}))

export function PageSettingsGeneral({
  onSubmit,
  loading,
  publicOptionNotAvailable,
  databaseVersionOptions,
  databaseVersionLoading,
  databaseMode,
}: PageSettingsGeneralProps) {
  const { control, formState } = useFormContext()

  const databasesAccessibility = Object.values(DatabaseAccessibilityEnum).map((value) => ({
    label: upperCaseFirstLetter(value),
    value: value,
  }))

  if (publicOptionNotAvailable) {
    databasesAccessibility.splice(1, 1)
  }

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
                  <ExternalLink
                    className="ml-4 gap-0.5"
                    href="https://hub.qovery.com/docs/using-qovery/configuration/database/#modes"
                    size="xs"
                  >
                    Learn more
                  </ExternalLink>
                </div>
              )}
            />
            {databaseVersionLoading ? (
              <div className="flex justify-center mb-6">
                <LoaderSpinner className="w-4" />
              </div>
            ) : (
              <div className="mb-3">
                <Controller
                  name="version"
                  control={control}
                  rules={{ required: 'Please select a database version' }}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelect
                      label="Version"
                      options={databaseVersionOptions || []}
                      onChange={field.onChange}
                      value={field.value}
                      error={error?.message}
                    />
                  )}
                />
                <Callout.Root className="mt-3" color="yellow">
                  <Callout.Icon>
                    <Icon name={IconAwesomeEnum.CIRCLE_INFO} />
                  </Callout.Icon>
                  <Callout.Text className="text-xs">
                    {databaseMode === DatabaseModeEnum.CONTAINER
                      ? 'Upgrading the version might cause service interruption. Have a look at the database documentation before launching the upgrade.'
                      : 'Upgrading the version might cause service interruption. Have a look at the cloud provider documentation before launching the upgrade.'}
                  </Callout.Text>
                </Callout.Root>
              </div>
            )}
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
                  <ExternalLink
                    className="ml-4 gap-0.5"
                    href="https://hub.qovery.com/docs/using-qovery/configuration/database/#accessibility"
                    size="xs"
                  >
                    Learn more
                  </ExternalLink>
                </>
              )}
            />
          </BlockContent>
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
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/database',
            linkLabel: 'How to configure my database',
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsGeneral
