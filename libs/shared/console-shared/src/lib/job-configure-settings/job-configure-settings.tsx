import { Controller, useFormContext } from 'react-hook-form'
import { JobConfigureData } from '@qovery/shared/interfaces'
import { InputText, Link } from '@qovery/shared/ui'
import EnableBox from '../enable-box/enable-box'
import EntrypointCmdInputs from '../entrypoint-cmd-inputs/entrypoint-cmd-inputs'

export interface JobConfigureSettingsProps {
  jobType: 'cron' | 'lifecycle'
}

export function JobConfigureSettings(props: JobConfigureSettingsProps) {
  const { control, setValue, getValues } = useFormContext<JobConfigureData>()

  return (
    <div>
      {props.jobType === 'cron' ? (
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
            <p className="text-text-500 text-xs ">Every minutes</p>
            <Link
              external={true}
              link="https://docs.qovery.com/docs/faq#what-is-a-cron-expression"
              className="text-text-400 !text-xs"
              linkLabel="CRON expression builder"
            />
          </div>
          <EntrypointCmdInputs entrypointRequired />
        </>
      ) : (
        <div className="mb-10">
          <h3 className="text-sm font-semibold mb-1">Event</h3>
          <p className="text-text-500 text-sm mb-3">
            Select one or more environment event where the job should be executed
          </p>

          <EnableBox
            className="mb-3"
            checked={getValues().on_start?.enabled || false}
            title="Start"
            name="on_start"
            description="Execute this job when the environment starts"
            setChecked={(checked) => {
              setValue('on_start.enabled', checked)
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
            checked={getValues().on_stop?.enabled || false}
            setChecked={(checked) => {
              setValue('on_stop.enabled', checked)
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
            checked={getValues().on_delete?.enabled || false}
            setChecked={(checked) => {
              setValue('on_delete.enabled', checked)
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
