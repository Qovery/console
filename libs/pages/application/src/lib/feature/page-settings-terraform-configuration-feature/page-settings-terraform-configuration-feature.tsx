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
    if (!service || !data) return

    if (service.serviceType === 'TERRAFORM') {
      const payload: TerraformRequest & { serviceType: 'TERRAFORM' } = {
        ...service,
        ...data,
        serviceType: 'TERRAFORM',
        terraform_files_source: {
          git_repository: {
            url: service.terraform_files_source?.git?.git_repository?.url ?? '',
            branch: service.terraform_files_source?.git?.git_repository?.branch ?? '',
            git_token_id: service.terraform_files_source?.git?.git_repository?.git_token_id ?? '',
          },
        },
        provider: 'TERRAFORM' as TerraformRequestProviderEnum,
        terraform_variables_source: {
          tf_vars: [],
          tf_var_file_paths: [],
        },
      }

      editService({
        serviceId: service.id,
        payload,
      })
    }
  })

  return (
    <div className="flex w-full max-w-content-with-navigation-left flex-col p-8">
      <FormProvider {...methods}>
        <TerraformConfigurationSettings methods={methods} isSettings />
        <div className="mt-10 flex justify-end">
          <Button
            type="submit"
            size="lg"
            onClick={onSubmit}
            disabled={!methods.formState.isValid}
            loading={isLoadingEditService}
          >
            Save
          </Button>
        </div>
      </FormProvider>
    </div>
  )
}
