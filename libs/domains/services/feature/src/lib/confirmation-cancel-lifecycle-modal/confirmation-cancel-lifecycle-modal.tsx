import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Checkbox, ModalCrud, useModal } from '@qovery/shared/ui'
import { useCancelDeploymentService } from '../hooks/use-cancel-deployment-service/use-cancel-deployment-service'

export interface ConfirmationCancelLifecycleModalProps {
  onClose: () => void
  organizationId: string
  projectId: string
  environmentId: string
}

export function ConfirmationCancelLifecycleModal({
  onClose,
  organizationId,
  projectId,
  environmentId,
}: ConfirmationCancelLifecycleModalProps) {
  const { enableAlertClickOutside } = useModal()

  const { mutate: cancelDeployment, isLoading: isCancelDeploymentLoading } = useCancelDeploymentService({
    organizationId,
    projectId,
  })

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      force: false,
    },
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const onSubmit = methods.handleSubmit(({ force }) => {
    cancelDeployment({ environmentId, force: force })
    return onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Cancel deployment"
        description="Cancelling the deployment will rollback the application to the previous version. Managed database deployments cannot be cancelled."
        onClose={onClose}
        onSubmit={onSubmit}
        loading={isCancelDeploymentLoading}
        submitLabel="Confirm"
      >
        <Controller
          name="force"
          control={methods.control}
          render={({ field }) => (
            <label className="flex">
              <Checkbox
                className="relative top-0.5 mr-3 h-4 min-w-4"
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <div className="mb-2 flex flex-col gap-1">
                <span className="text-sm font-medium text-neutral-400">Force Lifecycle job stop</span>
                <p className="text-sm text-neutral-350">
                  Cancel the deployment and stop the execution of any lifecycle job. Make sure that interrupting its
                  execution is safe.
                </p>
              </div>
            </label>
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default ConfirmationCancelLifecycleModal
