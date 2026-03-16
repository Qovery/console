import {
  type ApplicationDeploymentRestriction,
  DeploymentRestrictionModeEnum,
  DeploymentRestrictionTypeEnum,
  type TerraformDeploymentRestrictionResponse,
} from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useCreateDeploymentRestriction, useEditDeploymentRestriction } from '@qovery/domains/services/feature'
import { ExternalLink, InputSelect, InputText, ModalCrud, useModal } from '@qovery/shared/ui'

type DeploymentRestriction = ApplicationDeploymentRestriction | TerraformDeploymentRestrictionResponse

interface ServiceDeploymentRestrictionsModalProps {
  deploymentRestriction?: DeploymentRestriction
  onClose: () => void
  serviceId: string
}

export function ServiceDeploymentRestrictionsModal({
  deploymentRestriction,
  onClose,
  serviceId,
}: ServiceDeploymentRestrictionsModalProps) {
  const { mutate: createRestriction, isLoading: isCreateRestrictionLoading } = useCreateDeploymentRestriction()
  const { mutate: editRestriction, isLoading: isEditRestrictionLoading } = useEditDeploymentRestriction()

  const methods = useForm({
    defaultValues: {
      mode: deploymentRestriction?.mode ?? DeploymentRestrictionModeEnum.EXCLUDE,
      type: deploymentRestriction?.type ?? DeploymentRestrictionTypeEnum.PATH,
      value: deploymentRestriction?.value ?? '',
    },
    mode: 'onChange',
  })

  const { control, formState } = methods
  const { enableAlertClickOutside } = useModal()

  useEffect(() => {
    enableAlertClickOutside(formState.isDirty)
  }, [enableAlertClickOutside, formState.isDirty])

  const handleSubmit: FormEventHandler<HTMLFormElement> = methods.handleSubmit((payload) => {
    if (deploymentRestriction) {
      editRestriction({
        serviceId,
        serviceType: 'JOB',
        deploymentRestrictionId: deploymentRestriction.id,
        payload,
      })
    } else {
      createRestriction({
        serviceId,
        serviceType: 'JOB',
        payload,
      })
    }

    onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={deploymentRestriction ? 'Edit restriction' : 'Create restriction'}
        description="Specify which changes in your repository should trigger or not an auto-deploy of your job."
        isEdit={Boolean(deploymentRestriction)}
        loading={isCreateRestrictionLoading || isEditRestrictionLoading}
        onSubmit={handleSubmit}
        onClose={onClose}
        howItWorks={
          <>
            <p>Two modes can be selected:</p>
            <ul className="ml-4 list-disc">
              <li>EXCLUDE: commits on the file or folder defined in the "Value" field will be ignored</li>
              <li>MATCH: only commits on the file or folder defined in the "Value" field will trigger a deployment</li>
            </ul>
            <p>Wildcards are not supported in the "Value" field</p>
            <ExternalLink
              className="mt-2"
              href="https://www.qovery.com/docs/configuration/deployment/auto-deploy#filtering-commits"
            >
              Documentation
            </ExternalLink>
          </>
        }
      >
        <Controller
          name="mode"
          control={control}
          rules={{ required: 'Please enter a value.' }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              className="mb-6"
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              options={Object.values(DeploymentRestrictionModeEnum).map((mode) => ({
                value: mode,
                label: mode,
              }))}
              label="Mode"
            />
          )}
        />

        <Controller
          name="type"
          control={control}
          rules={{ required: 'Please enter a value.' }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              className="mb-6"
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              options={Object.values(DeploymentRestrictionTypeEnum).map((type) => ({
                value: type,
                label: type,
              }))}
              label="Type"
              disabled
            />
          )}
        />

        <Controller
          name="value"
          control={control}
          rules={{ required: 'Please enter a value.' }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              label="Value"
            />
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default ServiceDeploymentRestrictionsModal
