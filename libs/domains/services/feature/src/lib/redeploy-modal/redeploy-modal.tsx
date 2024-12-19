import { Controller, FormProvider, useForm } from 'react-hook-form'
import { type AnyService } from '@qovery/domains/services/data-access'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { InputRadio, ModalCrud, useModal } from '@qovery/shared/ui'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import { useRestartService } from '../hooks/use-restart-service/use-restart-service'

export interface RedeployModalProps {
  organizationId: string
  projectId: string
  service: AnyService
}

export function RedeployModal({ service, organizationId, projectId }: RedeployModalProps) {
  const { closeModal } = useModal()

  const { data: deploymentService } = useDeploymentStatus({
    environmentId: service.environment.id,
    serviceId: service.id,
  })
  const { mutateAsync: deployService, isLoading: isLoadingDeployService } = useDeployService({
    environmentId: service.environment.id,
    logsLink:
      ENVIRONMENT_LOGS_URL(organizationId, projectId, service.environment.id) +
      DEPLOYMENT_LOGS_VERSION_URL(service.id, deploymentService?.execution_id),
  })
  const { mutateAsync: restartService, isLoading: isLoadingRestartService } = useRestartService({
    environmentId: service.environment.id,
  })

  const methods = useForm<{ action: 'redeploy' | 'restart' }>({
    mode: 'onChange',
    defaultValues: {
      action: 'redeploy',
    },
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      if (data.action === 'redeploy') {
        await deployService({ serviceId: service.id, serviceType: service.serviceType })
      } else {
        await restartService({ serviceId: service.id, serviceType: service.serviceType })
      }
      closeModal()
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Service redeploy"
        description="We have detected no changes to be deployed for this service. Select the action you want to apply."
        onSubmit={onSubmit}
        onClose={closeModal}
        submitLabel="Confirm"
        loading={isLoadingDeployService || isLoadingRestartService}
      >
        <Controller
          name="action"
          control={methods.control}
          render={({ field }) => (
            <div className="flex flex-col gap-6">
              <InputRadio
                value="redeploy"
                name={field.name}
                label="Redeploy"
                description="This action will not restart your service but it will allow to align again your configuration with your cluster."
                onChange={field.onChange}
                formValue={field.value}
              />
              <InputRadio
                value="restart"
                name={field.name}
                label="Restart service"
                description="To restart the pods of your service."
                onChange={field.onChange}
                formValue={field.value}
              />
            </div>
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default RedeployModal
