import posthog from 'posthog-js'
import { type Control, Controller, type UseFieldArrayReturn, useFormContext } from 'react-hook-form'
import { Button, CodeEditor, InputText } from '@qovery/shared/ui'

export interface KedaScalersFieldsProps {
  control: Control
  scalersFieldArray: UseFieldArrayReturn
  disabled?: boolean
  pollingInterval?: number
  cooldownPeriod?: number
}

export function KedaScalersFields({
  control,
  scalersFieldArray,
  disabled = false,
  pollingInterval,
  cooldownPeriod,
}: KedaScalersFieldsProps) {
  const { fields: scalers, append, remove } = scalersFieldArray
  const { watch } = useFormContext()

  const minRunningInstances = watch('min_running_instances')
  const maxRunningInstances = watch('max_running_instances')

  const handleAddScaler = () => {
    append({ type: '', config: '', triggerAuthentication: '' })

    posthog.capture('service-keda-scaler-added', {
      min_running_instances: minRunningInstances,
      max_running_instances: maxRunningInstances,
      scaler_count: scalers.length + 1,
    })
  }

  const handleRemoveScaler = (index: number) => {
    remove(index)
  }

  return (
    <>
      {/* Polling interval and cooldown period */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="autoscaling_polling_interval"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <InputText
              type="number"
              name={field.name}
              label="Polling Interval (seconds)"
              value={field.value ?? pollingInterval ?? ''}
              onChange={field.onChange}
              disabled={disabled}
              hint="Default: 30 seconds"
              error={error?.message}
            />
          )}
        />
        <Controller
          name="autoscaling_cooldown_period"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <InputText
              type="number"
              name={field.name}
              label="Cooldown Period (seconds)"
              value={field.value ?? cooldownPeriod ?? ''}
              onChange={field.onChange}
              disabled={disabled}
              hint="Default: 300 seconds"
              error={error?.message}
            />
          )}
        />
      </div>

      {/* Scalers list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-400">Scalers</label>
          <Button size="xs" type="button" onClick={handleAddScaler} disabled={disabled}>
            Add scaler
          </Button>
        </div>

        {scalers.length === 0 && (
          <p className="text-xs text-neutral-350">No scalers configured. Click "Add scaler" to get started.</p>
        )}

        {scalers.map((_: unknown, index: number) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded border border-neutral-250 bg-neutral-100 p-4"
            data-testid="scaler-row"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-400">Scaler #{index + 1}</span>
              <Button
                size="xs"
                type="button"
                variant="surface"
                color="red"
                onClick={() => handleRemoveScaler(index)}
                disabled={disabled}
              >
                Remove
              </Button>
            </div>

            <Controller
              name={`scalers.${index}.type`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  name={field.name}
                  label="Scaler Type"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    field.onChange(e)
                    if (e.target.value) {
                      posthog.capture('service-keda-scaler-type-set', {
                        scaler_type: e.target.value,
                        min_running_instances: minRunningInstances,
                        max_running_instances: maxRunningInstances,
                      })
                    }
                  }}
                  disabled={disabled}
                  hint="Type: 'cpu', 'memory', 'prometheus', 'aws-sqs', etc."
                  error={error?.message}
                />
              )}
            />

            <Controller
              name={`scalers.${index}.config`}
              control={control}
              render={({ field }) => {
                const lineCount = (field.value ?? '').split('\n').length
                const displayLines = Math.min(Math.max(lineCount, 3), 5)
                const height = `${displayLines * 19 + 10}px`

                return (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-neutral-400">Configuration (YAML)</label>
                    <CodeEditor
                      height={height}
                      language="yaml"
                      value={field.value ?? ''}
                      onChange={(value) => field.onChange(value ?? '')}
                      options={{
                        readOnly: disabled,
                      }}
                    />
                    <p className="text-xs text-neutral-350">Paste raw YAML for this scaler</p>
                  </div>
                )
              }}
            />

            <Controller
              name={`scalers.${index}.triggerAuthentication`}
              control={control}
              render={({ field }) => {
                const lineCount = (field.value ?? '').split('\n').length
                const displayLines = Math.min(Math.max(lineCount, 3), 5)
                const height = `${displayLines * 19 + 10}px`

                return (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-neutral-400">
                      Trigger Authentication (YAML) - Optional
                    </label>
                    <CodeEditor
                      height={height}
                      language="yaml"
                      value={field.value ?? ''}
                      onChange={(value) => field.onChange(value ?? '')}
                      options={{
                        readOnly: disabled,
                      }}
                    />
                    <p className="text-xs text-neutral-350">Paste raw YAML for the trigger authentication (optional)</p>
                  </div>
                )
              }}
            />
          </div>
        ))}
      </div>
    </>
  )
}
