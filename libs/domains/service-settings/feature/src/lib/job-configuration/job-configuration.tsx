import { useParams } from '@tanstack/react-router'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobConfigureData, type JobGeneralData } from '@qovery/shared/interfaces'
import { Button, Section } from '@qovery/shared/ui'
import { joinArgsWithQuotes, parseCmd } from '@qovery/shared/util-js'
import { JobConfigurationForm } from './job-configuration-form/job-configuration-form'

export const JobConfiguration = () => {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ serviceId, serviceType: 'JOB', suspense: true })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const schedule = match(service)
    .with({ job_type: 'CRON' }, (s) => {
      const { cronjob } = s.schedule
      return {
        schedule: cronjob?.scheduled_at,
        timezone: cronjob?.timezone,
      }
    })
    .with({ job_type: 'LIFECYCLE' }, (s) => {
      const { on_start, on_delete, on_stop, lifecycle_type } = s.schedule

      return {
        on_start: {
          enabled: !!on_start,
          arguments_string:
            on_start?.arguments && on_start?.arguments?.length > 0
              ? joinArgsWithQuotes(on_start?.arguments)
              : undefined,
          entrypoint: on_start?.entrypoint,
        },
        on_stop: {
          enabled: !!on_stop,
          arguments_string:
            on_stop?.arguments && on_stop?.arguments.length > 0 ? joinArgsWithQuotes(on_stop?.arguments) : undefined,
          entrypoint: on_stop?.entrypoint,
        },
        on_delete: {
          enabled: !!on_delete,
          arguments_string:
            on_delete?.arguments && on_delete?.arguments.length > 0
              ? joinArgsWithQuotes(on_delete?.arguments)
              : undefined,
          entrypoint: on_delete?.entrypoint,
        },
        lifecycle_type,
      }
    })
    .otherwise(() => ({}))

  const methods = useForm<JobConfigureData & Pick<JobGeneralData, 'image_entry_point' | 'cmd_arguments' | 'cmd'>>({
    mode: 'onChange',
    defaultValues: {
      max_duration: service?.max_duration_seconds,
      nb_restarts: service?.max_nb_restart,
      port: service?.port || undefined,
      ...schedule,
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (!service) return

    const schedule = match(service)
      .with({ job_type: 'CRON' }, (s) => {
        return {
          cronjob: {
            scheduled_at: data.schedule || '',
            timezone: data.timezone,
            entrypoint: s.schedule.cronjob?.entrypoint,
            arguments: s.schedule.cronjob?.arguments,
          },
        }
      })
      .with({ job_type: 'LIFECYCLE' }, (s) => {
        return {
          lifecycle_type: s.schedule.lifecycle_type,
          on_start: data.on_start?.enabled
            ? {
                entrypoint: data.on_start.entrypoint,
                arguments: data.on_start.arguments_string ? parseCmd(data.on_start.arguments_string) : undefined,
              }
            : undefined,
          on_stop: data.on_stop?.enabled
            ? {
                entrypoint: data.on_stop.entrypoint,
                arguments: data.on_stop.arguments_string ? parseCmd(data.on_stop.arguments_string) : undefined,
              }
            : undefined,
          on_delete: data.on_delete?.enabled
            ? {
                entrypoint: data.on_delete.entrypoint,
                arguments: data.on_delete.arguments_string ? parseCmd(data.on_delete.arguments_string) : undefined,
              }
            : undefined,
        }
      })
      .otherwise(() => undefined)

    if (!schedule) return

    editService({
      serviceId: service.id,
      payload: {
        ...service,
        max_duration_seconds: data.max_duration,
        max_nb_restart: data.nb_restarts,
        port: data.port,
        schedule,
      },
    })
  })

  if (!service) return

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="px-8 pb-8 pt-6">
        <FormProvider {...methods}>
          <div className="flex w-full flex-col justify-between">
            <div>
              <SettingsHeading
                title={match(service)
                  .with({ service_type: 'JOB', job_type: 'CRON' }, () => 'Job configuration')
                  .with({ service_type: 'JOB', job_type: 'LIFECYCLE' }, () => 'Triggers')
                  .otherwise(() => '')}
                description={match(service)
                  .with(
                    { service_type: 'JOB', job_type: 'CRON' },
                    () => 'Job configuration allows you to control the behavior of your service.'
                  )
                  .with(
                    { service_type: 'JOB', job_type: 'LIFECYCLE' },
                    () => 'Define the events triggering the execution of this job and the commands to execute.'
                  )
                  .otherwise(() => '')}
              />
              <div className="max-w-content-with-navigation-left">
                <form onSubmit={onSubmit} className="space-y-10">
                  <JobConfigurationForm
                    jobType={service.job_type === 'CRON' ? ServiceTypeEnum.CRON_JOB : ServiceTypeEnum.LIFECYCLE_JOB}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!methods.formState.isValid}
                      loading={isLoadingEditService}
                    >
                      Save
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </FormProvider>
      </Section>
    </div>
  )
}
