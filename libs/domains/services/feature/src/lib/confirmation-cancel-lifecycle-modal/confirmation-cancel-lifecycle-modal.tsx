import { Controller, FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { Callout, Checkbox, Icon, ModalCrud, useModal } from '@qovery/shared/ui'
import { useCancelDeploymentService } from '../hooks/use-cancel-deployment-service/use-cancel-deployment-service'

export interface ConfirmationCancelLifecycleModalProps {
  onClose: () => void
  organizationId: string
  projectId: string
  environmentId: string
  serviceKind?: 'LIFECYCLE' | 'TERRAFORM'
}

export function ConfirmationCancelLifecycleModal({
  onClose,
  organizationId,
  projectId,
  environmentId,
  serviceKind = 'LIFECYCLE',
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

  const copy = match(serviceKind)
    .with('LIFECYCLE', () => ({
      description:
        'Cancelling the deployment will rollback the application to the previous version. Managed database deployments cannot be cancelled.',
      forceLabel: 'Force Lifecycle job stop',
      forceHelp:
        'Cancel the deployment and stop the execution of any lifecycle job. Make sure that interrupting its execution is safe.',
      warning: null,
    }))
    .with('TERRAFORM', () => ({
      description:
        'Cancelling stops the deployment of the whole environment. Unless you force the stop, it waits for the running Terraform command to finish. Actions already performed are not rolled back.',
      forceLabel: 'Force Terraform stop',
      forceHelp:
        'Stop the running Terraform command now. It is killed if it does not stop within the grace period. The force applies to the whole environment: its other running jobs, including lifecycle jobs, are stopped too.',
      warning:
        'A forced stop can leave the Terraform state locked (use "Force unlock" in the service actions) and resources partly applied or orphaned. Check the state before you deploy again.',
    }))
    .exhaustive()

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Cancel deployment"
        description={copy.description}
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
                <span className="text-sm font-medium text-neutral">{copy.forceLabel}</span>
                <p className="text-sm text-neutral-subtle">{copy.forceHelp}</p>
              </div>
            </label>
          )}
        />
        {copy.warning && (
          <Callout.Root color="yellow" className="mt-4">
            <Callout.Icon>
              <Icon iconName="triangle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>{copy.warning}</Callout.Text>
          </Callout.Root>
        )}
      </ModalCrud>
    </FormProvider>
  )
}

export default ConfirmationCancelLifecycleModal
