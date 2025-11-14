import { useMemo } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import {
  type TerraformGeneralData,
  TerraformVariablesProvider,
  TerraformVariablesSettings,
  useTerraformEditVariables,
  useTerraformVariablesContext,
} from '@qovery/domains/service-terraform/feature'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { Button } from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'

const TerraformVariablesSettingsForm = () => {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const { handleSubmit } = useFormContext<TerraformGeneralData>()
  const { overrides, tfVarFiles } = useTerraformVariablesContext()
  const { data: service } = useService({ serviceId: applicationId })
  const { mutate: replaceAllTerraformVariables, isLoading: isLoadingReplaceVariables } = useTerraformEditVariables()
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const isLoading = useMemo(
    () => isLoadingReplaceVariables || isLoadingEditService,
    [isLoadingReplaceVariables, isLoadingEditService]
  )

  if (service?.serviceType !== 'TERRAFORM') {
    return null
  }

  const onSubmit = handleSubmit(() => {
    // Update all variables
    replaceAllTerraformVariables({
      serviceId: applicationId,
      payload: {
        variables: overrides.map((override) => ({
          key: override.key,
          value: override.value,
          secret: override.secret,
        })),
      },
    })
    // Update the service with the order of tfvars files
    const updatedService = buildEditServicePayload({
      service,
      request: {
        terraform_variables_source: {
          ...service.terraform_variables_source,
          tf_var_file_paths: [...tfVarFiles].reverse().map((file) => file.source),
        },
      },
    })
    editService({
      serviceId: applicationId,
      payload: updatedService,
    })
  })

  return (
    <>
      <TerraformVariablesSettings />

      <div className="mt-10 flex justify-end">
        <Button type="submit" size="lg" onClick={onSubmit} loading={isLoading}>
          Save
        </Button>
      </div>
    </>
  )
}

export const PageSettingsTerraformVariablesFeature = () => {
  const { applicationId = '' } = useParams()
  const { data: service } = useService({ serviceId: applicationId })
  const methods = useForm<TerraformGeneralData>({
    mode: 'onChange',
    defaultValues: match(service)
      .with({ serviceType: 'TERRAFORM' }, (s) => ({ ...s, state: 'kubernetes' }))
      .otherwise(() => ({})),
  })

  if (service?.serviceType !== 'TERRAFORM') {
    return
  }

  return (
    <div className="flex w-full max-w-[1024px] flex-col p-8">
      <FormProvider {...methods}>
        <TerraformVariablesProvider>
          <TerraformVariablesSettingsForm />
        </TerraformVariablesProvider>
      </FormProvider>
    </div>
  )
}
