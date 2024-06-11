import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Checkbox, ModalCrud, useModal } from '@qovery/shared/ui'
import { useCloneService } from '../hooks/use-clone-service/use-clone-service'
import { useService } from '../hooks/use-service/use-service'

export interface ConfirmationCancelLifecycleModalProps {
  onClose: () => void
  organizationId: string
  projectId: string
  serviceId: string
}

export function ConfirmationCancelLifecycleModal({
  onClose,
  organizationId,
  projectId,
  serviceId,
}: ConfirmationCancelLifecycleModalProps) {
  const { enableAlertClickOutside } = useModal()
  const { data: service } = useService({ serviceId })
  const { mutateAsync: cloneService, isLoading: isCloneServiceLoading } = useCloneService()

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      force: false,
    },
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const onSubmit = methods.handleSubmit(async ({ force }) => {
    if (!service) return null

    // const cloneRequest = {
    //   name,
    //   environment_id: environmentId,
    // }

    // const result = await cloneService({
    //   serviceId: service.id,
    //   serviceType: service.serviceType,
    //   payload: cloneRequest,
    // })

    return onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Cancel deployment"
        description="Cancelling the deployment will rollback the application to the previous version. Managed database deployments cannot be cancelled."
        onClose={onClose}
        onSubmit={onSubmit}
        loading={isCloneServiceLoading}
        submitLabel="Confirm"
      >
        <Controller
          name="force"
          control={methods.control}
          render={({ field }) => (
            <div className="mb-2 flex items-center last:mb-0">
              <Checkbox
                className="mr-3 h-4 w-4"
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <label className="text-sm font-medium text-neutral-400" htmlFor="Force Lifecycle job stop">
                Force Lifecycle job stop
              </label>
              <p>
                Cancel the deployment and stop the execution of any lifecycle job. Make sure that interrupting its
                execution is safe.
              </p>
            </div>
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default ConfirmationCancelLifecycleModal
