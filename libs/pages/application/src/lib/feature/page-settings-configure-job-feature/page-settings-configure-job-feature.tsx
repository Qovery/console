import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useDeploymentStatus, useEditService, useService } from '@qovery/domains/services/feature'
import { type JobConfigureData, type JobGeneralData } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { joinArgsWithQuotes, parseCmd } from '@qovery/shared/util-js'
import PageSettingsConfigureJob from '../../ui/page-settings-configure-job/page-settings-configure-job'

export function PageSettingsConfigureJobFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()

  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId: applicationId })
  const { data: service } = useService({ serviceId: applicationId, serviceType: 'JOB' })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    environmentId,
    logsLink:
      ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
      DEPLOYMENT_LOGS_VERSION_URL(service?.id, deploymentStatus?.execution_id),
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
    <FormProvider {...methods}>
      <PageSettingsConfigureJob service={service} loading={isLoadingEditService} onSubmit={onSubmit} />
    </FormProvider>
  )
}

export default PageSettingsConfigureJobFeature
