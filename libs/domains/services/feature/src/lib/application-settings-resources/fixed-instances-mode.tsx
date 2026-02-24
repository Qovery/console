import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { type Control, Controller, type FieldValues, type UseFormSetValue, useWatch } from 'react-hook-form'
import { Callout, Icon, InputText } from '@qovery/shared/ui'

export interface FixedInstancesModeProps {
  control: Control
  setValue: UseFormSetValue<FieldValues>
  minInstances: number
  maxInstances: number
  environmentMode?: EnvironmentModeEnum
}

export function FixedInstancesMode({
  control,
  setValue,
  minInstances,
  maxInstances,
  environmentMode,
}: FixedInstancesModeProps) {
  const minRunningInstances = useWatch({ control, name: 'min_running_instances' })
  const isProduction = environmentMode === EnvironmentModeEnum.PRODUCTION
  const hasSingleInstance = minRunningInstances === 1

  return (
    <>
      <Controller
        name="min_running_instances"
        control={control}
        rules={{
          required: true,
          min: minInstances,
          max: maxInstances,
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            type="number"
            label="Number of instances"
            name={field.name}
            value={isNaN(field.value) || field.value === 0 ? '' : field.value.toString()}
            onChange={(e) => {
              const output = parseInt(e.target.value, 10)
              const value = isNaN(output) ? 0 : output
              field.onChange(value)
              setValue('max_running_instances', value)
            }}
            error={
              error?.type === 'required'
                ? 'Please enter a size.'
                : error?.type === 'max'
                  ? `Maximum allowed is: ${maxInstances}.`
                  : error?.type === 'min'
                    ? `Minimum allowed is: ${minInstances}.`
                    : undefined
            }
          />
        )}
      />
      {isProduction && hasSingleInstance && (
        <Callout.Root color="yellow" className="mt-3">
          <Callout.Icon>
            <Icon iconName="triangle-exclamation" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            We strongly discourage running your production environment with only one instance. This setup might create
            service downtime in case of cluster upgrades. Set a minimum of 2 instances for your service to ensure high
            availability.
          </Callout.Text>
        </Callout.Root>
      )}
    </>
  )
}
