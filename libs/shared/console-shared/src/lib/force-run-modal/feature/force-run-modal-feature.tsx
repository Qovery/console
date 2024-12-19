import { JobForceEvent } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { type Job } from '@qovery/domains/services/data-access'
import { useDeployService, useDeploymentStatus } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { useModal } from '@qovery/shared/ui'
import ForceRunModal from '../ui/force-run-modal'

export interface ForceRunModalFeatureProps {
  organizationId: string
  projectId: string
  service: Job
}

export function ForceRunModalFeature({ organizationId, projectId, service }: ForceRunModalFeatureProps) {
  const { data: deploymentStatus } = useDeploymentStatus({
    environmentId: service.environment.id,
    serviceId: service.id,
  })
  const { mutateAsync: deployService, isLoading: isLoadingEditService } = useDeployService({
    environmentId: service.environment.id,
    logsLink:
      ENVIRONMENT_LOGS_URL(organizationId, projectId, service.environment.id) +
      DEPLOYMENT_LOGS_VERSION_URL(service.id, deploymentStatus?.execution_id),
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
