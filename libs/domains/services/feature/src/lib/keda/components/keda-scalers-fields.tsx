import posthog from 'posthog-js'
import { useEffect } from 'react'
import { type Control, Controller, type UseFieldArrayReturn, useFormContext } from 'react-hook-form'
import { Button, CodeEditor, ExternalLink, InputText, InputToggle } from '@qovery/shared/ui'
import { parseScalerJsonConfig, validateInitialCooldownPeriod } from '@qovery/shared/util-services'

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
  const { watch, trigger } = useFormContext()

  const minRunningInstances = watch('min_running_instances')
  const maxRunningInstances = watch('max_running_instances')
  const idleScaleToZero = watch('autoscaling_idle_scale_to_zero')
  const advancedEnabled = watch('autoscaling_advanced_enabled')

  // Scaling to 0 when idle depends on the minimum instances, which is set in another field
  useEffect(() => {
    if (idleScaleToZero) {
      trigger('autoscaling_idle_scale_to_zero')
    }
  }, [minRunningInstances, idleScaleToZero, trigger])

  const handleAddScaler = () => {
    append({ type: '', config: '', configFormat: 'yaml', triggerAuthentication: '' })

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
        <Controller
          name="autoscaling_initial_cooldown_period"
          control={control}
          rules={{ validate: validateInitialCooldownPeriod }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              type="number"
              name={field.name}
              label="Initial Cooldown Period (seconds)"
              value={field.value ?? ''}
              onChange={field.onChange}
              disabled={disabled}
              hint="Delay after creation before scaling to 0. Default: 0 seconds"
              error={error?.message}
            />
          )}
        />
      </div>

      <Controller
        name="autoscaling_idle_scale_to_zero"
        control={control}
        rules={{
          validate: (value, formValues) =>
            !value ||
            Number(formValues['min_running_instances']) > 0 ||
            'Scaling to 0 when idle requires a minimum of at least 1 instance',
        }}
        render={({ field, fieldState: { error } }) => (
          <div className="flex flex-col gap-1">
            <InputToggle
              small
              align="top"
              name={field.name}
              value={Boolean(field.value)}
              onChange={field.onChange}
              disabled={disabled}
              title="Scale to 0 when idle"
              description="When no scaler is active, scale down to 0 instances instead of the minimum (KEDA idleReplicaCount)."
            />
            {error?.message && <p className="ml-11 text-xs text-negative">{error.message}</p>}
          </div>
        )}
      />

      {/* Advanced ScaledObject settings, hidden unless enabled */}
      <div className="mt-6 flex flex-col gap-3">
        <Controller
          name="autoscaling_advanced_enabled"
          control={control}
          render={({ field }) => (
            <InputToggle
              small
              align="top"
              name={field.name}
              value={Boolean(field.value)}
              onChange={field.onChange}
              disabled={disabled}
              title="Advanced configuration"
              description="Set the KEDA ScaledObject advanced field in YAML, e.g. horizontalPodAutoscalerConfig.behavior to tune how fast instances scale down."
            />
          )}
        />

        {advancedEnabled && (
          <Controller
            name="autoscaling_advanced_yaml"
            control={control}
            render={({ field }) => {
              const lineCount = (field.value ?? '').split('\n').length
              const displayLines = Math.min(Math.max(lineCount, 5), 15)
              const height = `${displayLines * 19 + 10}px`

              return (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-neutral" htmlFor={field.name}>
                    Advanced configuration (YAML)
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
                  <p className="text-xs text-neutral-subtle">
                    Allowed keys: horizontalPodAutoscalerConfig, restoreToOriginalReplicaCount and scalingModifiers.{' '}
                    <ExternalLink size="xs" href="https://keda.sh/docs/2.19/reference/scaledobject-spec/#advanced">
                      Learn more about advanced settings
                    </ExternalLink>
                  </p>
                </div>
              )
            }}
          />
        )}
      </div>

      {/* Scalers list */}
      <div className="flex flex-col gap-3">
        <div className="mt-6 flex items-center justify-between">
          <label className="text-base font-medium text-neutral">Scalers</label>
          <Button size="xs" type="button" onClick={handleAddScaler} disabled={disabled}>
            Add scaler
          </Button>
        </div>

        <p className="text-xs text-neutral-subtle">
          <ExternalLink size="xs" href="https://www.qovery.com/docs/configuration/application#scaler-configuration">
            Learn more about scaler configuration
          </ExternalLink>
        </p>

        {scalers.length === 0 && (
          <p className="text-xs text-neutral-subtle">No scalers configured. Click "Add scaler" to get started.</p>
        )}

        {scalers.map((_: unknown, index: number) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded border border-neutral bg-surface-neutral-subtle p-4"
            data-testid="scaler-row"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral">Scaler #{index + 1}</span>
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
                const isJson = watch(`scalers.${index}.configFormat`) === 'json'
                const isInvalidJson = isJson && !!field.value?.trim() && !parseScalerJsonConfig(field.value)

                return (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-neutral" htmlFor={field.name}>
                      Configuration ({isJson ? 'JSON' : 'YAML'})
                    </label>
                    <CodeEditor
                      height={height}
                      language={isJson ? 'json' : 'yaml'}
                      value={field.value ?? ''}
                      onChange={(value) => field.onChange(value ?? '')}
                      options={{
                        readOnly: disabled,
                      }}
                    />
                    {isInvalidJson ? (
                      <p className="text-xs text-warning">
                        Not a valid JSON object: this configuration will be saved as YAML
                      </p>
                    ) : (
                      <p className="text-xs text-neutral-subtle">
                        Paste raw {isJson ? 'JSON' : 'YAML'} for this scaler
                      </p>
                    )}
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
                    <label className="text-sm font-medium text-neutral">Trigger Authentication (YAML) - Optional</label>
                    <CodeEditor
                      height={height}
                      language="yaml"
                      value={field.value ?? ''}
                      onChange={(value) => field.onChange(value ?? '')}
                      options={{
                        readOnly: disabled,
                      }}
                    />
                    <p className="text-xs text-neutral-subtle">
                      Paste raw YAML for the trigger authentication (optional)
                    </p>
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
