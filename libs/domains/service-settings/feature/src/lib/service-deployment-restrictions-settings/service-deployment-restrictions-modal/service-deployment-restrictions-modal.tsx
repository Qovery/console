import {
  type ApplicationDeploymentRestriction,
  DeploymentRestrictionModeEnum,
  DeploymentRestrictionTypeEnum,
  type TerraformDeploymentRestrictionResponse,
} from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { type Application, type Helm, type Job, type Terraform } from '@qovery/domains/services/data-access'
import { useCreateDeploymentRestriction, useEditDeploymentRestriction } from '@qovery/domains/services/feature'
import { ExternalLink, InputSelect, InputText, ModalCrud, useModal } from '@qovery/shared/ui'

type DeploymentRestriction = ApplicationDeploymentRestriction | TerraformDeploymentRestrictionResponse
type SupportedService = Application | Job | Helm | Terraform

interface ServiceDeploymentRestrictionsModalProps {
  deploymentRestriction?: DeploymentRestriction
  onClose: () => void
  serviceId: string
  serviceType: SupportedService['serviceType']
}

export function ServiceDeploymentRestrictionsModal({
  deploymentRestriction,
  onClose,
  serviceId,
  serviceType,
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
        serviceType,
        deploymentRestrictionId: deploymentRestriction.id,
        payload,
      })
    } else {
      createRestriction({
        serviceId,
        serviceType,
        payload,
      })
    }

    onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={deploymentRestriction ? 'Edit restriction' : 'Create restriction'}
        description="Specify which changes in your repository should trigger or not an auto-deploy of your service."
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
              className="mb-6 hidden"
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
          rules={{
            required: 'Please enter a path.',
            validate: (value: string) => {
              if (!value) {
                return 'Please enter a path.'
              }
              if (value.startsWith('/')) {
                return 'Path must not start with a forward slash (/)'
              }
              if (value.includes('*')) {
                return 'Wildcards (*) are not supported in the path'
              }
              // allow path prefixes (e.g. docs/) for partial matching
              return true
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              label="Path"
              hint="e.g. docs/, src/jobs, src/index.ts"
            />
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default ServiceDeploymentRestrictionsModal
