import { type TerraformRequest, type TerraformRequestProviderEnum } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { TerraformConfigurationSettings, type TerraformGeneralData } from '@qovery/domains/service-terraform/feature'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { Button } from '@qovery/shared/ui'

export default function PageSettingsTerraformConfigurationFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const { data: service } = useService({ serviceId: applicationId })
  console.log('🚀 ~ service:', service)
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const methods = useForm<TerraformGeneralData>({
    mode: 'onChange',
    defaultValues: match(service)
      .with({ serviceType: 'TERRAFORM' }, (s) => ({ ...s, state: 'kubernetes' }))
      .otherwise(() => ({})),
  })

  const onSubmit = methods.handleSubmit((data) => {
    console.log('🚀 ~ SUBMIT:', { service, data })

    if (!service || !data) return

    if (service.serviceType === 'TERRAFORM') {
      const payload = {
        ...service,
        // provider_version: data.provider_version,
        // description: data.description ?? '',
        // terraform_files_source: {
        //   git_repository: s.terraform_files_source?.git?.git_repository ?? '',
        // },
        // terraform_variables_source: {
        //   tf_vars: data.terraform_variables_source.tf_vars,
        //   tf_var_file_paths: data.terraform_variables_source.tf_var_file_paths,
        // },
        ...data,
        provider: 'TERRAFORM' as TerraformRequestProviderEnum,
        terraform_variables_source: {
          tf_vars: [],
          tf_var_file_paths: [],
        },
      }

      console.log('payload', payload)

      editService({
        serviceId: service.id,
        payload,
      })
    }
  })

  return (
    <div className="flex w-full max-w-content-with-navigation-left flex-col justify-between p-8">
      <FormProvider {...methods}>
        <TerraformConfigurationSettings methods={methods} />

        <div className="mt-10 flex justify-end">
          <div className="flex gap-3">
            <Button
              type="submit"
              size="lg"
              onClick={onSubmit}
              disabled={!methods.formState.isDirty || !methods.formState.isValid}
              loading={isLoadingEditService}
            >
              Save
            </Button>
          </div>
        </div>
      </FormProvider>
    </div>
  )
}
