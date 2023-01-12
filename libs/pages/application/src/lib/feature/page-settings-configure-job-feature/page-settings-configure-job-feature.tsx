import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editApplication, postApplicationActionsRestart, selectApplicationById } from '@qovery/domains/application'
import { ServiceTypeEnum, getServiceType, isCronJob, isLifeCycleJob } from '@qovery/shared/enums'
import { ApplicationEntity, JobConfigureData } from '@qovery/shared/interfaces'
import { toastError } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsConfigureJob from '../../ui/page-settings-configure-job/page-settings-configure-job'

export function PageSettingsConfigureJobFeature() {
  const { applicationId = '', environmentId = '' } = useParams()
  const methods = useForm<JobConfigureData>({ mode: 'onChange' })

  const application: ApplicationEntity | undefined = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    (a, b) => {
      return JSON.stringify(a?.id) === JSON.stringify(b?.id)
    }
  ) as ApplicationEntity | undefined

  const [loading, setLoading] = useState(false)

  const dispatch = useDispatch<AppDispatch>()

  const toasterCallback = () => {
    if (application) {
      dispatch(
        postApplicationActionsRestart({ applicationId, environmentId, serviceType: getServiceType(application) })
      )
    }
  }

  useEffect(() => {
    if (application) {
      methods.setValue('max_duration', application.max_duration_seconds)
      methods.setValue('nb_restarts', application.max_nb_restart)
      methods.setValue('port', application.port || undefined)

      if (isCronJob(application)) {
        methods.setValue('schedule', application.schedule?.cronjob?.scheduled_at || undefined)
        methods.setValue('cmd_arguments', JSON.stringify(application.schedule?.cronjob?.arguments) || undefined)
        methods.setValue('image_entry_point', application.schedule?.cronjob?.entrypoint || undefined)
      } else {
        methods.setValue('on_start.enabled', !!application.schedule?.on_start)
        if (application.schedule?.on_start?.arguments && application.schedule?.on_start?.arguments.length > 0) {
          methods.setValue('on_start.arguments_string', JSON.stringify(application.schedule.on_start.arguments))
        }
        methods.setValue('on_start.entrypoint', application.schedule?.on_start?.entrypoint)

        methods.setValue('on_stop.enabled', !!application.schedule?.on_stop)
        if (application.schedule?.on_stop?.arguments && application.schedule?.on_stop?.arguments.length > 0) {
          methods.setValue('on_stop.arguments_string', JSON.stringify(application.schedule?.on_stop?.arguments))
        }
        methods.setValue('on_stop.entrypoint', application.schedule?.on_stop?.entrypoint)

        methods.setValue('on_delete.enabled', !!application.schedule?.on_delete)
        if (application.schedule?.on_delete?.arguments && application.schedule?.on_delete?.arguments.length > 0) {
          methods.setValue('on_delete.arguments_string', JSON.stringify(application.schedule?.on_delete?.arguments))
        }
        methods.setValue('on_delete.entrypoint', application.schedule?.on_delete?.entrypoint)
      }
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
        } else {
          schedule.cronjob.arguments = undefined
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
          arguments: undefined,
        }

        if (data.on_start?.arguments_string && data.on_start?.arguments_string.length > 0) {
          try {
            schedule.on_start.arguments = eval(data.on_start.arguments_string)
          } catch (e: any) {
            toastError(e, 'Invalid CMD array')
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
          } catch (e: any) {
            toastError(e, 'Invalid CMD array')
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
          } catch (e: any) {
            toastError(e, 'Invalid CMD array')
            return
          }
        }
      }

      job.schedule = schedule
    }

    dispatch(
      editApplication({
        data: job,
        applicationId: job.id as string,
        serviceType: ServiceTypeEnum.JOB,
        toasterCallback,
      })
    )
      .unwrap()
      .then(() => {})
      .finally(() => setLoading(false))
      .catch((e) => console.error(e))
  })

  return (
    <FormProvider {...methods}>
      <PageSettingsConfigureJob application={application} loading={loading} onSubmit={onSubmit} />
    </FormProvider>
  )
}

export default PageSettingsConfigureJobFeature
