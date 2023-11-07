import { Controller, useFormContext } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import { BlockContent, Callout, ExternalLink, Icon, IconAwesomeEnum, InputSelect } from '@qovery/shared/ui'

export interface SettingsResourcesInstanceTypesProps {
  databaseInstanceTypes?: Value[]
  displayWarning?: boolean
}

export function SettingsResourcesInstanceTypes({
  databaseInstanceTypes = [],
  displayWarning,
}: SettingsResourcesInstanceTypesProps) {
  const { control } = useFormContext()

  return (
    <BlockContent title="Instance Type">
      <Controller
        name="instance_type"
        control={control}
        rules={{
          required: 'Please select an instance type',
        }}
        render={({ field, fieldState: { error } }) => (
          <div>
            <InputSelect
              isSearchable
              onChange={field.onChange}
              value={field.value}
              label="Instance type"
              error={error?.message}
              options={databaseInstanceTypes}
            />
            <p className="text-neutral-350 text-xs mt-3">
              The chosen instance type has a direct impact on your cloud provider cost.
            </p>
          </div>
        )}
      />
      {displayWarning && (
        <Callout.Root className="mt-3" color="yellow" data-testid="settings-resources-instance-types-warning">
          <Callout.Icon>
            <Icon name={IconAwesomeEnum.CIRCLE_INFO} />
          </Callout.Icon>
          <Callout.Text className="text-xs text-neutral-350">
            Once triggered, the update will be managed by your cloud provider and applied during the configured
            maintenance window. Moreover, the operation might cause a service interruption.{' '}
            <ExternalLink
              className="mt-1"
              href="https://hub.qovery.com/docs/using-qovery/configuration/database/#applying-changes-to-a-managed-database"
              size="xs"
            >
              Have a look at the documentation first
            </ExternalLink>
          </Callout.Text>
        </Callout.Root>
      )}
    </BlockContent>
  )
}

export default SettingsResourcesInstanceTypes
