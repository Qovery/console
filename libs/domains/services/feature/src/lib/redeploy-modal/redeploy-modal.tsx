import { Controller, FormProvider, useForm } from 'react-hook-form'
import { type AnyService } from '@qovery/domains/services/data-access'
import { InputRadio, ModalCrud, useModal } from '@qovery/shared/ui'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'
import { useRestartService } from '../hooks/use-restart-service/use-restart-service'

export interface RedeployModalProps {
  organizationId: string
  projectId: string
  service: AnyService
}

export function RedeployModal({ service, organizationId, projectId }: RedeployModalProps) {
  const { closeModal } = useModal()

  const { mutateAsync: deployService, isLoading: isLoadingDeployService } = useDeployService({
    organizationId,
    projectId,
    environmentId: service.environment.id,
  })
  const { mutateAsync: restartService, isLoading: isLoadingRestartService } = useRestartService({
    organizationId,
    projectId,
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
