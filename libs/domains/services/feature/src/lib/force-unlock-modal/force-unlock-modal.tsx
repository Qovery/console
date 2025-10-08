import { type Environment, TerraformDeployRequestActionEnum } from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Checkbox, ModalCrud, useModal } from '@qovery/shared/ui'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'

export const ForceUnlockModal = ({ environment, service }: { environment: Environment; service: AnyService }) => {
  const { closeModal } = useModal()
  const { mutate: deployService } = useDeployService({
    organizationId: environment.organization.id,
    projectId: environment.project.id,
    environmentId: environment.id,
  })

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      acknowledge: false,
    },
  })

  const onSubmit = methods.handleSubmit(() => {
    if (service.serviceType !== 'TERRAFORM') return

    deployService({
      serviceId: service.id,
      serviceType: service.serviceType,
      request: { action: TerraformDeployRequestActionEnum.FORCE_UNLOCK },
    })
    closeModal()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Force unlock"
        description={
          <div className="flex flex-col gap-1">
            <span>This will manually release the Terraform state lock.</span>
            <span>
              Use only if a previous job crashed or left the state blocked. If the state is not locked, nothing will
              happen.
            </span>
          </div>
        }
        onClose={closeModal}
        onSubmit={onSubmit}
        submitLabel="Force unlock"
      >
        <Controller
          name="acknowledge"
          rules={{
            required: true,
          }}
          control={methods.control}
          render={({ field }) => (
            <div className="flex gap-3">
              <Checkbox
                id={field.name}
                className="h-4 w-4 min-w-4"
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <label className="relative -top-1 flex flex-col gap-1 text-sm" htmlFor={field.name}>
                <span className="font-medium text-neutral-400">
                  No other Terraform job is executing before continuing
                </span>
                <span className="text-neutral-350">
                  Unlocking while another deployment is running may corrupt the Terraform state.
                </span>
              </label>
            </div>
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}
