import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { type JobConfigureData, type JobGeneralData } from '@qovery/shared/interfaces'
import { toastError } from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import PageSettingsConfigureJob from '../../ui/page-settings-configure-job/page-settings-configure-job'

export function PageSettingsConfigureJobFeature() {
  const { environmentId = '', applicationId = '' } = useParams()

  const { data: service } = useService({ serviceId: applicationId, serviceType: 'JOB' })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({ environmentId })

  const schedule = match(service)
    .with({ job_type: 'CRON' }, (s) => {
      const { cronjob } = s.schedule
      return {
        schedule: cronjob?.scheduled_at,
        timezone: cronjob?.timezone,
        cmd_arguments:
          cronjob?.arguments && cronjob?.arguments.length > 0 ? JSON.stringify(cronjob?.arguments) : undefined,
        image_entry_point: cronjob?.entrypoint,
      }
    })
    .with({ job_type: 'LIFECYCLE' }, (s) => {
      const { on_start, on_delete, on_stop } = s.schedule
      return {
        on_start: {
          enabled: !!on_start,
          arguments_string:
            on_start?.arguments && on_start?.arguments?.length > 0 ? JSON.stringify(on_start?.arguments) : undefined,
          entrypoint: on_start?.entrypoint,
        },
        on_stop: {
          enabled: !!on_stop,
          arguments_string:
            on_stop?.arguments && on_stop?.arguments.length > 0 ? JSON.stringify(on_stop?.arguments) : undefined,
          entrypoint: on_stop?.entrypoint,
        },
        on_delete: {
          enabled: !!on_delete,
          arguments_string:
            on_delete?.arguments && on_delete?.arguments.length > 0 ? JSON.stringify(on_delete?.arguments) : undefined,
          entrypoint: on_delete?.entrypoint,
        },
      }
    })
    .otherwise(() => undefined)

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

    try {
      const schedule = match(service)
        .with({ job_type: 'CRON' }, () => {
          return {
            cronjob: {
              scheduled_at: data.schedule || '',
              entrypoint: data.image_entry_point,
              timezone: data.timezone,
              // thread `eval`: https://qovery.slack.com/archives/C02NPSG2HBL/p1664352927296669
              arguments: data.cmd_arguments ? eval(data.cmd_arguments) : undefined,
            },
          }
        })
        .with({ job_type: 'LIFECYCLE' }, () => {
          return {
            on_start: data.on_start?.enabled
              ? {
                  entrypoint: data.on_start.entrypoint,
                  // thread `eval`: https://qovery.slack.com/archives/C02NPSG2HBL/p1664352927296669
                  arguments: data.on_start.arguments_string ? eval(data.on_start.arguments_string) : undefined,
                }
              : undefined,
            on_stop: data.on_stop?.enabled
              ? {
                  entrypoint: data.on_stop.entrypoint,
                  // thread `eval`: https://qovery.slack.com/archives/C02NPSG2HBL/p1664352927296669
                  arguments: data.on_stop.arguments_string ? eval(data.on_stop.arguments_string) : undefined,
                }
              : undefined,
            on_delete: data.on_delete?.enabled
              ? {
                  entrypoint: data.on_delete.entrypoint,
                  // thread `eval`: https://qovery.slack.com/archives/C02NPSG2HBL/p1664352927296669
                  arguments: data.on_delete.arguments_string ? eval(data.on_delete.arguments_string) : undefined,
                }
              : undefined,
          }
        })
        .otherwise(() => undefined)

      if (!schedule) return

      editService({
        serviceId: service.id,
        payload: buildEditServicePayload({
          service,
          request: {
            max_duration_seconds: data.max_duration,
            max_nb_restart: data.nb_restarts,
            port: data.port,
            schedule,
          },
        }),
      })
    } catch (e: unknown) {
      toastError(e as Error, 'Invalid CMD array')
      return
    }
  })

  if (!service) return

  return (
    <FormProvider {...methods}>
      <PageSettingsConfigureJob service={service} loading={isLoadingEditService} onSubmit={onSubmit} />
    </FormProvider>
  )
}

export default PageSettingsConfigureJobFeature
