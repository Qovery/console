import { Controller, useFormContext } from 'react-hook-form'
import { InputText, InputToggle } from '@qovery/shared/ui'
import { formatCronExpression } from '@qovery/shared/util-js'
import { TimezoneSetting } from '../../timezone-setting/timezone-setting'

export interface AgenticWorkflowScheduleFormValues {
  scheduleEnabled: boolean
  scheduleCronExpression: string
  timezone: string
}

export function isAgenticWorkflowScheduleValid(values: AgenticWorkflowScheduleFormValues) {
  return !values.scheduleEnabled || Boolean(formatCronExpression(values.scheduleCronExpression))
}

export function AgenticWorkflowScheduleFields({ autoFocus = false }: { autoFocus?: boolean }) {
  const { control, setValue, watch } = useFormContext<AgenticWorkflowScheduleFormValues>()
  const scheduleEnabled = watch('scheduleEnabled')
  const scheduleCronExpression = watch('scheduleCronExpression')
  const timezone = watch('timezone')
  const formattedSchedule = formatCronExpression(scheduleCronExpression)

  return (
    <div className="flex flex-col gap-4">
      <InputToggle
        autoFocus={autoFocus}
        small
        align="top"
        value={scheduleEnabled}
        title="Schedule agent task"
        description="Run this agent task automatically on top of its webhook."
        onChange={(value) => setValue('scheduleEnabled', value, { shouldDirty: true, shouldValidate: true })}
      />
      {scheduleEnabled ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="scheduleCronExpression"
            control={control}
            rules={{
              required: 'Please enter a cron expression.',
              validate: (value) => Boolean(formatCronExpression(value)) || 'Invalid cron expression.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                name={field.name}
                label="Cron expression"
                value={field.value}
                hint={formattedSchedule ? `${formattedSchedule} (${timezone})` : undefined}
                error={error?.message}
                onChange={field.onChange}
              />
            )}
          />
          <TimezoneSetting />
        </div>
      ) : null}
    </div>
  )
}
