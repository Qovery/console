import { JobResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editApplication, selectApplicationById } from '@qovery/domains/application'
import { ServiceTypeEnum, isCronJob, isLifeCycleJob } from '@qovery/shared/enums'
import { ApplicationEntity, JobConfigureData } from '@qovery/shared/interfaces'
import { toastError } from '@qovery/shared/toast'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsConfigure from '../../ui/page-settings-configure/page-settings-configure'

export function PageSettingsConfigureFeature() {
  const { applicationId = '' } = useParams()
  const methods = useForm<JobConfigureData>()

  const application: JobResponse | undefined = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    (a, b) => JSON.stringify(a?.id) === JSON.stringify(b?.id)
  ) as JobResponse | undefined

  const [loading, setLoading] = useState(false)

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    methods.setValue('max_duration', application?.max_duration_seconds)
    methods.setValue('nb_restarts', application?.max_nb_restart)
    methods.setValue('port', application?.port || undefined)

    if (isCronJob(application)) {
      methods.setValue('schedule', application?.schedule?.cronjob?.scheduled_at || undefined)
      methods.setValue('cmd_arguments', JSON.stringify(application?.schedule?.cronjob?.arguments) || undefined)
      methods.setValue('image_entry_point', application?.schedule?.cronjob?.entrypoint || undefined)
    } else {
      methods.setValue('on_start.enabled', !!application?.schedule?.on_start)
      methods.setValue('on_start.arguments_string', JSON.stringify(application?.schedule?.on_start?.arguments))
      methods.setValue('on_start.entrypoint', application?.schedule?.on_start?.entrypoint)

      methods.setValue('on_stop.enabled', !!application?.schedule?.on_stop)
      methods.setValue('on_stop.arguments_string', JSON.stringify(application?.schedule?.on_stop?.arguments))
      methods.setValue('on_stop.entrypoint', application?.schedule?.on_stop?.entrypoint)

      methods.setValue('on_delete.enabled', !!application?.schedule?.on_delete)
      methods.setValue('on_delete.arguments_string', JSON.stringify(application?.schedule?.on_delete?.arguments))
      methods.setValue('on_delete.entrypoint', application?.schedule?.on_delete?.entrypoint)
    }
  }, [application, methods])

  const onSubmit = methods.handleSubmit((data) => {
    setLoading(true)
    const job = { ...application }

    job.max_duration_seconds = data.max_duration
    job.max_nb_restart = data.nb_restarts
    job.port = data.port

    if (isCronJob(application)) {
      const schedule: any = {}
      if (job.schedule?.cronjob) {
        schedule.cronjob = {
          scheduled_at: data.schedule || '',
        }

        if (data.cmd_arguments) {
          try {
            schedule.cronjob.arguments = eval(data.cmd_arguments)
          } catch (e: any) {
            toastError(e, 'Invalid CMD array')
            return
          }
        }
        schedule.cronjob.entrypoint = data.image_entry_point
      }
      job.schedule = schedule
    }

    if (isLifeCycleJob(application)) {
      const schedule: any = {}
      if (data.on_start?.enabled) {
        schedule.on_start = {
          entrypoint: data.on_start.entrypoint,
        }

        try {
          if (data.on_start?.arguments_string) {
            schedule.on_start.arguments = eval(data.on_start.arguments_string)
          }
        } catch (e: any) {
          toastError(e, 'Invalid CMD array')
          return
        }
      }

      if (data.on_stop?.enabled) {
        schedule.on_stop = {
          entrypoint: data.on_stop.entrypoint,
        }

        try {
          if (data.on_stop?.arguments_string) {
            schedule.on_stop.arguments = eval(data.on_stop.arguments_string)
          }
        } catch (e: any) {
          toastError(e, 'Invalid CMD array')
          return
        }
      }

      if (data.on_delete?.enabled) {
        schedule.on_delete = {
          entrypoint: data.on_delete.entrypoint,
        }

        try {
          if (data.on_delete?.arguments_string) {
            schedule.on_delete.arguments = eval(data.on_delete.arguments_string)
          }
        } catch (e: any) {
          toastError(e, 'Invalid CMD array')
          return
        }
      }

      job.schedule = schedule
    }

    dispatch(
      editApplication({
        data: job,
        applicationId: job.id as string,
        serviceType: ServiceTypeEnum.JOB,
        toasterCallback: () => {
          console.log('toaster')
        },
      })
    )
      .unwrap()
      .then(() => {})
      .finally(() => setLoading(false))
      .catch((e) => console.error(e))
  })

  return (
    <FormProvider {...methods}>
      <PageSettingsConfigure application={application} loading={loading} onSubmit={onSubmit} />
    </FormProvider>
  )
}

export default PageSettingsConfigureFeature
