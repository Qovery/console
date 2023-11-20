import { useQueryClient } from '@tanstack/react-query'
import { JobForceEvent } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { forceRunJob, selectApplicationById } from '@qovery/domains/application'
import { isCronJob } from '@qovery/shared/enums'
import { type ApplicationEntity, type JobApplicationEntity } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { useModal } from '@qovery/shared/ui'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import ForceRunModal from '../ui/force-run-modal'

export interface ForceRunModalFeatureProps {
  organizationId: string
  projectId: string
  environmentId: string
  applicationId: string
}

export function ForceRunModalFeature({
  organizationId,
  projectId,
  environmentId,
  applicationId,
}: ForceRunModalFeatureProps) {
  const application = useSelector<RootState, ApplicationEntity | undefined>((state: RootState) =>
    selectApplicationById(state, applicationId)
  )
  const { closeModal } = useModal()
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const methods = useForm({
    mode: 'all',
    defaultValues: {
      selected: '',
    },
  })

  useEffect(() => {
    if (isCronJob(application)) {
      methods.setValue('selected', 'cron')
    }
  }, [application, methods])

  const onSubmit = methods.handleSubmit((data) => {
    let event: JobForceEvent
    switch (data.selected) {
      case 'start':
        event = JobForceEvent.START
        break
      case 'stop':
        event = JobForceEvent.STOP
        break
      case 'delete':
        event = JobForceEvent.DELETE
        break
      default:
        event = JobForceEvent.CRON
    }

    if (data.selected) {
      setIsLoading(true)
      dispatch(
        forceRunJob({
          applicationId,
          jobForceEvent: event,
          callback: () =>
            navigate(
              ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(applicationId)
            ),
          queryClient,
        })
      ).then(() => {
        closeModal()
      })
    }
  })

  return (
    <FormProvider {...methods}>
      <ForceRunModal
        application={application as JobApplicationEntity}
        closeModal={closeModal}
        onSubmit={onSubmit}
        isCronJob={isCronJob(application)}
        isLoading={isLoading}
      />
    </FormProvider>
  )
}

export default ForceRunModalFeature
