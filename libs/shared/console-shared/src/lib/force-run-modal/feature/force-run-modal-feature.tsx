import { JobForceEvent } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { type Job } from '@qovery/domains/services/data-access'
import { useDeployService } from '@qovery/domains/services/feature'
import { useModal } from '@qovery/shared/ui'
import ForceRunModal from '../ui/force-run-modal'

export interface ForceRunModalFeatureProps {
  service: Job
}

export function ForceRunModalFeature({ service }: ForceRunModalFeatureProps) {
  const { mutateAsync: deployService, isLoading: isLoadingEditService } = useDeployService({
    environmentId: service.environment.id,
  })
  const { closeModal } = useModal()

  const methods = useForm({
    mode: 'all',
    defaultValues: {
      selected: service.job_type === 'CRON' ? 'cron' : '',
    },
  })

  const onSubmit = methods.handleSubmit(async (data) => {
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
      try {
        await deployService({
          serviceId: service.id,
          serviceType: 'JOB',
          forceEvent: event,
        })
        closeModal()
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <FormProvider {...methods}>
      <ForceRunModal
        service={service}
        closeModal={closeModal}
        onSubmit={onSubmit}
        isCronJob={service.job_type === 'CRON'}
        isLoading={isLoadingEditService}
      />
    </FormProvider>
  )
}

export default ForceRunModalFeature
