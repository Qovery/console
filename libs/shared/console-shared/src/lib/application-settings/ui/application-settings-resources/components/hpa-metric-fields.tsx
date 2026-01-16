import { type Control, Controller, type FieldValues, type UseFormSetValue } from 'react-hook-form'
import { InputRadio, InputText } from '@qovery/shared/ui'

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
            <div className="flex flex-col gap-3">
              <InputRadio
                name={field.name}
                value="CPU"
                label="CPU only"
                description="Scale based on CPU usage"
                isChecked={field.value === 'CPU'}
                onChange={() => {
                  field.onChange('CPU')
                }}
                formValue={field.value}
              />
              <InputRadio
                name={field.name}
                value="CPU_AND_MEMORY"
                label="CPU + Memory"
                description="Scale based on CPU and memory usage"
                isChecked={field.value === 'CPU_AND_MEMORY'}
                onChange={() => {
                  field.onChange('CPU_AND_MEMORY')
                }}
                formValue={field.value}
              />
            </div>
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
