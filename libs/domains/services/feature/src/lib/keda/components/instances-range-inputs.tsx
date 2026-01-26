import { type Control, Controller, type FieldErrors, useWatch } from 'react-hook-form'
import { InputText } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'

export interface InstancesRangeInputsProps {
  control: Control
  minInstances: number
  maxInstances: number
  minRunningInstances?: number
  disabled?: boolean
  showMaxField?: boolean
  runningPods?: number
  requireMinLessThanMax?: boolean
}

export function InstancesRangeInputs({
  control,
  minInstances,
  maxInstances,
  disabled = false,
  showMaxField = true,
  runningPods,
  requireMinLessThanMax = false,
}: InstancesRangeInputsProps) {
  const minRunningInstancesValue = useWatch({ control, name: 'min_running_instances' })

  const getErrorMessage = (error: FieldErrors[string], fieldName: string) => {
    if (!error) return undefined
    if (error.type === 'required') return 'Please enter a size.'
    if (error.type === 'max') return `Maximum allowed is: ${maxInstances}.`
    if (error.type === 'min') {
      const minValue = fieldName === 'max_running_instances' ? minRunningInstancesValue : minInstances
      return `Minimum allowed is: ${minValue}.`
    }
    if (error.type === 'validate') return error.message as string
    return undefined
  }

  return (
    <>
      <div className={showMaxField ? 'grid grid-cols-2 gap-4' : ''}>
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
              label={showMaxField ? 'Instances min' : 'Number of instances'}
              name={field.name}
              value={isNaN(field.value) ? '' : field.value.toString()}
              onChange={(e) => {
                const output = parseInt(e.target.value, 10)
                const value = isNaN(output) ? 0 : output
                field.onChange(value)
              }}
              disabled={disabled}
              error={getErrorMessage(error, field.name)}
            />
          )}
        />

        {showMaxField && (
          <Controller
            name="max_running_instances"
            control={control}
            rules={{
              required: true,
              max: maxInstances,
              min: minRunningInstancesValue,
              validate: requireMinLessThanMax
                ? (value: number) => {
                    if (value <= minRunningInstancesValue) {
                      return 'Maximum instances must be greater than minimum instances.'
                    }
                    return true
                  }
                : undefined,
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                type="number"
                label="Instances max"
                name={field.name}
                value={isNaN(field.value) ? '' : field.value.toString()}
                onChange={(e) => {
                  const output = parseInt(e.target.value, 10)
                  const value = isNaN(output) ? 0 : output
                  field.onChange(value)
                }}
                disabled={disabled}
                error={getErrorMessage(error, field.name)}
              />
            )}
          />
        )}
      </div>

      {runningPods !== undefined && (
        <p className="text-xs text-neutral-350">
          <span className="mb-1 flex">
            Current consumption: {runningPods} ${pluralize(runningPods, 'instance')}
          </span>
        </p>
      )}
    </>
  )
}
