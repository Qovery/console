import { type CronJobResponseAllOfSchedule, type LifecycleJobResponseAllOfSchedule } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { type JobConfigureData } from '@qovery/shared/interfaces'
import { toastError } from '@qovery/shared/ui'
import PageSettingsConfigureJob from '../../ui/page-settings-configure-job/page-settings-configure-job'

export function PageSettingsConfigureJobFeature() {
  const { environmentId = '', applicationId = '' } = useParams()
  const methods = useForm<JobConfigureData>({ mode: 'onChange' })

  const { data: service } = useService({ serviceId: applicationId, serviceType: 'JOB' })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({ environmentId })

  useEffect(() => {
    if (service) {
      methods.setValue('max_duration', service.max_duration_seconds)
      methods.setValue('nb_restarts', service.max_nb_restart)
      methods.setValue('port', service.port || undefined)

      // TODO: should be typeguard
      if (service.job_type === 'CRON') {
        const { cronjob } = service.schedule
        methods.setValue('schedule', cronjob?.scheduled_at || undefined)
        methods.setValue('cmd_arguments', JSON.stringify(cronjob?.arguments) || undefined)
        methods.setValue('image_entry_point', cronjob?.entrypoint || undefined)
      } else {
        const { on_start, on_delete, on_stop } = service.schedule
        methods.setValue('on_start.enabled', !!on_start)
        if (on_start?.arguments && on_start?.arguments.length > 0) {
          methods.setValue('on_start.arguments_string', JSON.stringify(on_start.arguments))
        }
        methods.setValue('on_start.entrypoint', on_start?.entrypoint)

        methods.setValue('on_stop.enabled', !!on_stop)
        if (on_stop?.arguments && on_stop?.arguments.length > 0) {
          methods.setValue('on_stop.arguments_string', JSON.stringify(on_stop?.arguments))
        }
        methods.setValue('on_stop.entrypoint', on_stop?.entrypoint)

        methods.setValue('on_delete.enabled', !!on_delete)
        if (on_delete?.arguments && on_delete?.arguments.length > 0) {
          methods.setValue('on_delete.arguments_string', JSON.stringify(on_delete?.arguments))
        }
        methods.setValue('on_delete.entrypoint', on_delete?.entrypoint)
      }
    }
  }, [service, methods])

  const onSubmit = methods.handleSubmit((data) => {
    if (!service) return

    const job = { ...service }

    job.max_duration_seconds = data.max_duration
    job.max_nb_restart = data.nb_restarts
    job.port = data.port

    if (service.job_type === 'CRON') {
      const schedule: CronJobResponseAllOfSchedule = {}
      if ('cronjob' in job.schedule) {
        schedule.cronjob = {
          scheduled_at: data.schedule || '',
        }

        if (data.cmd_arguments) {
          try {
            schedule.cronjob.arguments = eval(data.cmd_arguments)
          } catch (e: unknown) {
            toastError(e as Error, 'Invalid CMD array')
            return
          }
        } else {
          schedule.cronjob.arguments = undefined
        }
        schedule.cronjob.entrypoint = data.image_entry_point
      }
      job.schedule = schedule
    }

    if (service.job_type === 'LIFECYCLE') {
      const schedule: LifecycleJobResponseAllOfSchedule = {}
      if (data.on_start?.enabled) {
        schedule.on_start = {
          entrypoint: data.on_start.entrypoint,
          arguments: undefined,
        }

        if (data.on_start?.arguments_string && data.on_start?.arguments_string.length > 0) {
          try {
            schedule.on_start.arguments = eval(data.on_start.arguments_string)
          } catch (e: unknown) {
            toastError(e as Error, 'Invalid CMD array')
            return
          }
        }
      }

      if (data.on_stop?.enabled) {
        schedule.on_stop = {
          entrypoint: data.on_stop.entrypoint,
          arguments: undefined,
        }

        if (data.on_stop?.arguments_string && data.on_stop?.arguments_string.length > 0) {
          try {
            schedule.on_stop.arguments = eval(data.on_stop.arguments_string)
          } catch (e: unknown) {
            toastError(e as Error, 'Invalid CMD array')
            return
          }
        }
      }

      if (data.on_delete?.enabled) {
        schedule.on_delete = {
          entrypoint: data.on_delete.entrypoint,
          arguments: undefined,
        }

        if (data.on_delete?.arguments_string && data.on_delete?.arguments_string.length > 0) {
          try {
            schedule.on_delete.arguments = eval(data.on_delete.arguments_string)
          } catch (e: unknown) {
            toastError(e as Error, 'Invalid CMD array')
            return
          }
        }
      }

      job.schedule = schedule
    }

    console.log(job)

    editService({
      serviceId: job.id,
      payload: job,
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
