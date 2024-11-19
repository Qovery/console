// TODO: Refactor cronstrue usage to only use formatCronExpression
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import cronstrue from 'cronstrue'
import { Controller, useFormContext } from 'react-hook-form'
import { TimezoneSetting } from '@qovery/domains/services/feature'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobConfigureData } from '@qovery/shared/interfaces'
import { Callout, EnableBox, ExternalLink, Heading, Icon, InputText, LoaderSpinner, Section } from '@qovery/shared/ui'
import { formatCronExpression } from '@qovery/shared/util-js'
import EntrypointCmdInputs from '../../entrypoint-cmd-inputs/ui/entrypoint-cmd-inputs'

export interface JobConfigureSettingsProps {
  jobType: JobType
  loading?: boolean
}

export function JobConfigureSettings(props: JobConfigureSettingsProps) {
  const { loading } = props
  const { control, watch } = useFormContext<JobConfigureData>()

  const watchSchedule = watch('schedule')
  const watchTimezone = watch('timezone') ?? 'Etc/UTC'
  const watchMaxDuration = watch('max_duration')

  return loading ? (
    <LoaderSpinner />
  ) : (
    <>
      {props.jobType === ServiceTypeEnum.CRON_JOB ? (
        <Section className="gap-4">
          <div className="flex justify-between">
            <Heading>CRON</Heading>
            <ExternalLink href="https://crontab.guru" size="sm">
              CRON expression builder
            </ExternalLink>
          </div>
          <Controller
            name="schedule"
            control={control}
            rules={{
              required: 'Value required',
              validate: (value) => {
                return (
                  cronstrue.toString(value || '', { throwExceptionOnParseError: false }).indexOf('An error') === -1 ||
                  'Invalid cron expression'
                )
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Schedule - Cron expression"
                hint={
                  formatCronExpression(watchSchedule) ? formatCronExpression(watchSchedule) + ` (${watchTimezone})` : ''
                }
                error={error?.message}
              />
            )}
          />
          <TimezoneSetting />
        </Section>
      ) : (
        <Section className="gap-4">
          <Heading>Events</Heading>
          <p className="text-sm text-neutral-350">
            Select one or more event where the job should be executed and the command to execute.
          </p>

          <Controller
            name="on_start.enabled"
            control={control}
            render={({ field }) => (
              <EnableBox
                className="flex flex-col gap-4"
                checked={field.value}
                title="Deploy"
                name="on_start"
                description="Execute this job when the environment/job is deployed"
                setChecked={field.onChange}
              >
                <EntrypointCmdInputs
                  cmdArgumentsFieldName="on_start.arguments_string"
                  imageEntryPointFieldName="on_start.entrypoint"
                />
              </EnableBox>
            )}
          />

          <Controller
            name="on_stop.enabled"
            control={control}
            render={({ field }) => (
              <EnableBox
                className="flex flex-col gap-4"
                checked={field.value}
                title="Stop"
                name="on_stop"
                description="Execute this job when the environment/job stops"
                setChecked={field.onChange}
              >
                <EntrypointCmdInputs
                  cmdArgumentsFieldName="on_stop.arguments_string"
                  imageEntryPointFieldName="on_stop.entrypoint"
                />
              </EnableBox>
            )}
          />

          <Controller
            name="on_delete.enabled"
            control={control}
            render={({ field }) => (
              <EnableBox
                className="flex flex-col gap-4"
                checked={field.value}
                title="Delete"
                name="on_delete"
                description="Execute this job when the environment/job is deleted"
                setChecked={field.onChange}
              >
                <EntrypointCmdInputs
                  cmdArgumentsFieldName="on_delete.arguments_string"
                  imageEntryPointFieldName="on_delete.entrypoint"
                />
              </EnableBox>
            )}
          />
        </Section>
      )}

      <Section className="gap-4">
        <Heading>Execution behaviour</Heading>
        <Controller
          name="nb_restarts"
          control={control}
          rules={{
            required: 'Value required',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              type="number"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Number of restarts"
              hint="Maximum number of restarts allowed in case of job failure (0 means no failure). Restarts follow an exponential re-try policy (after 10s, 20s, 40s ... capped at six minutes)"
              error={error?.message}
            />
          )}
        />

        <Controller
          name="max_duration"
          control={control}
          rules={{
            required: 'Value required',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              type="number"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Max duration in seconds"
              hint="Maximum duration allowed for the job to run before killing it and mark it as failed"
              error={error?.message}
            />
          )}
        />

        {watchMaxDuration && watchMaxDuration > 3600 && (
          <Callout.Root color="yellow">
            <Callout.Icon>
              <Icon iconName="triangle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              If your job duration exceeds one hour, it may be forced shut down during the cloud provider's maintenance
              window.
            </Callout.Text>
          </Callout.Root>
        )}

        <Controller
          name="port"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <InputText
              type="number"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Port"
              hint="Port where to run readiness and liveliness probes checks. The port will not be exposed externally"
              error={error?.message}
            />
          )}
        />
      </Section>
    </>
  )
}

export default JobConfigureSettings
