import { JobForceEvent } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { forceRunJob, selectApplicationById } from '@qovery/domains/application'
import { isCronJob } from '@qovery/shared/enums'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import ForceRunModal from '../ui/force-run-modal'

export interface ForceRunModalFeatureProps {
  applicationId: string
}

export function ForceRunModalFeature(props: ForceRunModalFeatureProps) {
  const application = useSelector<RootState, ApplicationEntity | undefined>((state: RootState) =>
    selectApplicationById(state, props.applicationId)
  )
  const { closeModal } = useModal()
  const dispatch = useDispatch<AppDispatch>()

  const methods = useForm({
    mode: 'all',
    defaultValues: {
      selected: '',
    },
  })

  useEffect(() => {
    if (isCronJob(application) && methods) {
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
      dispatch(forceRunJob({ applicationId: props.applicationId, jobForceEvent: event })).then(() => {
        closeModal()
      })
    }
  })

  return (
    <FormProvider {...methods}>
      <ForceRunModal
        application={application}
        closeModal={closeModal}
        onSubmit={onSubmit}
        isCronJob={isCronJob(application)}
      />
    </FormProvider>
  )
}

export default ForceRunModalFeature
