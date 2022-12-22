import cronstrue from 'cronstrue'
import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { JobConfigureData } from '@qovery/shared/interfaces'
import { EnableBox, InputText, Link, LoaderSpinner } from '@qovery/shared/ui'
import EntrypointCmdInputs from '../../entrypoint-cmd-inputs/ui/entrypoint-cmd-inputs'

export interface JobConfigureSettingsProps {
  jobType: JobType
  loading?: boolean
}

export function JobConfigureSettings(props: JobConfigureSettingsProps) {
  const { loading } = props
  const { control, setValue, getValues, watch } = useFormContext<JobConfigureData>()
  const { on_start, on_stop, on_delete } = getValues()

  const watchSchedule = watch('schedule')
  const [cronDescription, setCronDescription] = useState('')

  useEffect(() => {
    if (watchSchedule) {
      // check if watchSchedule is a valid cron expression
      const isValidCron = cronstrue.toString(watchSchedule, { throwExceptionOnParseError: false })
      if (isValidCron.indexOf('An error') === -1) {
        setCronDescription(isValidCron)
      }
    }
  }, [watchSchedule])

  return loading ? (
    <LoaderSpinner />
  ) : (
    <div>
      {props.jobType === ServiceTypeEnum.CRON_JOB ? (
        <>
          <h3 className="text-sm font-semibold mb-3">CRON</h3>
          <Controller
            name="schedule"
            control={control}
            rules={{
              required: 'Value required',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                className="mb-2"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Schedule - Cron expression"
                error={error?.message}
              />
            )}
          />
          <div className="mb-3 flex justify-between">
            <p className="text-text-500 text-xs">{cronDescription}</p>
            <Link
              external
              link="https://crontab.guru/"
              className="text-text-400 !text-xs"
              linkLabel="CRON expression builder"
            />
          </div>
          <EntrypointCmdInputs />
        </>
      ) : (
        <div className="mb-10">
          <h3 className="text-sm font-semibold mb-1">Event</h3>
          <p className="text-text-500 text-sm mb-3">
            Select one or more environment event where the job should be executed
          </p>

          <EnableBox
            className="mb-3"
            checked={on_start?.enabled}
            title="Start"
            name="on_start"
            description="Execute this job when the environment starts"
            setChecked={(checked) => {
              if (checked !== undefined) setValue('on_start.enabled', checked)
            }}
          >
            <EntrypointCmdInputs
              className="mt-4"
              cmdArgumentsFieldName="on_start.arguments_string"
              imageEntryPointFieldName="on_start.entrypoint"
            />
          </EnableBox>

          <EnableBox
            className="mb-3"
            name="on_stop"
            checked={on_stop?.enabled}
            setChecked={(checked) => {
              if (checked !== undefined) setValue('on_stop.enabled', checked)
            }}
            title="Stop"
            description="Execute this job when the environment stops"
          >
            <EntrypointCmdInputs
              className="mt-4"
              cmdArgumentsFieldName="on_stop.arguments_string"
              imageEntryPointFieldName="on_stop.entrypoint"
            />
          </EnableBox>
          <EnableBox
            className="mb-3"
            name="on_delete"
            checked={on_delete?.enabled}
            setChecked={(checked) => {
              if (checked !== undefined) setValue('on_delete.enabled', checked)
            }}
            title="Delete"
            description="Execute this job when the environment is deleted"
          >
            <EntrypointCmdInputs
              className="mt-4"
              cmdArgumentsFieldName="on_delete.arguments_string"
              imageEntryPointFieldName="on_delete.entrypoint"
            />
          </EnableBox>
        </div>
      )}

      <h3 className="text-sm font-semibold mb-3 mt-8">Parameters</h3>
      <Controller
        name="nb_restarts"
        control={control}
        rules={{
          required: 'Value required',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            type="number"
            className="mb-2"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Number of restarts"
            error={error?.message}
          />
        )}
      />
      <p className="text-text-400 text-xs mb-3">
        Maximum number of restarts allowed in case of job failure (0 means no failure)
      </p>

      <Controller
        name="max_duration"
        control={control}
        rules={{
          required: 'Value required',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            type="number"
            className="mb-2"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Max duration in seconds"
            error={error?.message}
          />
        )}
      />

      <p className="text-text-400 text-xs mb-3">
        Maximum duration allowed for the job to run before killing it and mark it as failed
      </p>

      <Controller
        name="port"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputText
            type="number"
            className="mb-2"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Port"
            error={error?.message}
          />
        )}
      />

      <p className="text-text-400 text-xs mb-3">
        Port where to run readiness and liveliness probes checks. The port will not be exposed externally
      </p>
    </div>
  )
}

export default JobConfigureSettings
