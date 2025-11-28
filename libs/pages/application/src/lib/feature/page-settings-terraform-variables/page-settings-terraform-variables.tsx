import { useMemo } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import {
  type TerraformGeneralData,
  TerraformVariablesProvider,
  TerraformVariablesSettings,
  useTerraformVariablesContext,
} from '@qovery/domains/service-terraform/feature'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { Button } from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'

const TerraformVariablesSettingsForm = () => {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const { handleSubmit } = useFormContext<TerraformGeneralData>()
  const { serializeForApi, tfVarFiles, errors } = useTerraformVariablesContext()
  const { data: service } = useService({ serviceId: applicationId })

  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  if (service?.serviceType !== 'TERRAFORM') {
    return null
  }

  const onSubmit = handleSubmit(() => {
    // Edit the service with the updated variables and the updated order of tfvars files
    const payload = buildEditServicePayload({
      service,
      request: {
        terraform_variables_source: {
          ...service.terraform_variables_source,
          tf_vars: serializeForApi(),
          tf_var_file_paths: [...tfVarFiles.filter((file) => file.enabled)].reverse().map((file) => file.source),
        },
      },
    })
    editService({
      serviceId: applicationId,
      payload,
    })
  })

  return (
    <>
      <TerraformVariablesSettings />
      <div className="mt-10 flex justify-end">
        <Button type="submit" size="lg" onClick={onSubmit} loading={isLoadingEditService} disabled={errors.size > 0}>
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
