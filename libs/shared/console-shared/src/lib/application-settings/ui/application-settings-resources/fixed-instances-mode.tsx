import { type Control, Controller, type FieldValues, type UseFormSetValue } from 'react-hook-form'
import { Callout, Icon, InputText } from '@qovery/shared/ui'

export interface FixedInstancesModeProps {
  control: Control
  setValue: UseFormSetValue<FieldValues>
  minInstances: number
  maxInstances: number
}

export function FixedInstancesMode({ control, setValue, minInstances, maxInstances }: FixedInstancesModeProps) {
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
              // Set max = min for fixed instances
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
      <Callout.Root color="sky" className="mt-3">
        <Callout.Icon>
          <Icon iconName="circle-info" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>
          With fixed instances, your service will always run the exact number of instances specified above.
        </Callout.Text>
      </Callout.Root>
    </>
  )
}
