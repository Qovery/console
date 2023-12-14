import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { GeneralSetting } from '@qovery/domains/services/feature'
import { type Value } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  Callout,
  ExternalLink,
  HelpSection,
  Icon,
  IconAwesomeEnum,
  InputSelect,
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
          {databaseMode === DatabaseModeEnum.MANAGED && (
            <Callout.Root className="mb-5" color="yellow">
              <Callout.Icon>
                <Icon name={IconAwesomeEnum.TRIANGLE_EXCLAMATION} />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>Qovery manages this resource for you </Callout.TextHeading>
                <Callout.TextDescription className="text-xs">
                  Use exclusively the Qovery console to update the resources managed by Qovery on your cloud account.
                  <br /> Do not manually update or upgrade them on the cloud provider console, otherwise you will risk a
                  drift in the configuration. <br />
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          )}
          <BlockContent title="General information">
            <GeneralSetting label="Database name" />
            <Controller
              name="type"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  className="my-3"
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
                  {databaseMode === DatabaseModeEnum.CONTAINER ? (
                    <Callout.Text className="text-xs">
                      Upgrading the version might cause service interruption. Have a look at the database documentation
                      before launching the upgrade.
                    </Callout.Text>
                  ) : (
                    <Callout.Text className="text-xs text-neutral-350">
                      Once triggered, the update will be managed by your cloud provider and applied during the
                      configured maintenance window. Moreover, the operation might cause a service interruption.{' '}
                      <ExternalLink
                        className="mt-1"
                        href="https://hub.qovery.com/docs/using-qovery/configuration/database/#applying-changes-to-a-managed-database"
                        size="xs"
                      >
                        Have a look at the documentation first
                      </ExternalLink>
                    </Callout.Text>
                  )}
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
            <Button type="submit" size="lg" loading={loading} disabled={!formState.isValid}>
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
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsGeneral
