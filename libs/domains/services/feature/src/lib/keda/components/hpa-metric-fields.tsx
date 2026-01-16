import { type Control, Controller, type FieldValues, type UseFormSetValue } from 'react-hook-form'
import { InputText, RadioGroup } from '@qovery/shared/ui'

export interface HpaMetricFieldsProps {
  control: Control
  setValue: UseFormSetValue<FieldValues>
  hpaMetricType?: string
}

export function HpaMetricFields({ control, setValue, hpaMetricType }: HpaMetricFieldsProps) {
  return (
    <>
      {/* Metric choice */}
      <Controller
        name="hpa_metric_type"
        control={control}
        render={({ field }) => (
          <div className="mb-5">
            <label className="mb-3 block text-sm font-medium text-neutral-400">Autoscaling metric</label>
            <RadioGroup.Root onValueChange={field.onChange} value={field.value} className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-start gap-3 rounded border border-neutral-250 bg-neutral-100 p-4">
                <RadioGroup.Item value="CPU" />
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-neutral-400">CPU only</span>
                  <span className="text-sm text-neutral-350">Scale based on CPU usage</span>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded border border-neutral-250 bg-neutral-100 p-4">
                <RadioGroup.Item value="CPU_AND_MEMORY" />
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-neutral-400">CPU + Memory</span>
                  <span className="text-sm text-neutral-350">Scale based on CPU and memory usage</span>
                </div>
              </label>
            </RadioGroup.Root>
          </div>
        )}
      />

      {/* CPU threshold */}
      <Controller
        name="hpa_cpu_average_utilization_percent"
        control={control}
        rules={{
          required: true,
          min: 1,
          max: 100,
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            type="number"
            label="CPU average utilization (%)"
            name={field.name}
            value={isNaN(field.value) || field.value === 0 ? '' : field.value.toString()}
            onChange={(e) => {
              const output = parseInt(e.target.value, 10)
              const value = isNaN(output) ? 0 : output
              field.onChange(value)
            }}
            error={
              error?.type === 'required'
                ? 'Please enter a value.'
                : error?.type === 'min'
                  ? 'Minimum is 1%.'
                  : error?.type === 'max'
                    ? 'Maximum is 100%.'
                    : undefined
            }
          />
        )}
      />

      {/* Memory threshold (only if CPU_AND_MEMORY) */}
      {hpaMetricType === 'CPU_AND_MEMORY' && (
        <Controller
          name="hpa_memory_average_utilization_percent"
          control={control}
          rules={{
            required: true,
            min: 1,
            max: 100,
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              type="number"
              label="Memory average utilization (%)"
              name={field.name}
              value={isNaN(field.value) || field.value === 0 ? '' : field.value.toString()}
              onChange={(e) => {
                const output = parseInt(e.target.value, 10)
                const value = isNaN(output) ? 0 : output
                field.onChange(value)
              }}
              error={
                error?.type === 'required'
                  ? 'Please enter a value.'
                  : error?.type === 'min'
                    ? 'Minimum is 1%.'
                    : error?.type === 'max'
                      ? 'Maximum is 100%.'
                      : undefined
              }
            />
          )}
        />
      )}
    </>
  )
}
