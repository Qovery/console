import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { TerraformConfigurationSettings, type TerraformGeneralData } from '@qovery/domains/service-terraform/feature'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { Button } from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'

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
      const payload = {
        ...data,
        timeout_sec: Number(data.timeout_sec ?? service.timeout_sec),
      }

      editService({
        serviceId: service.id,
        payload: buildEditServicePayload({ service, request: payload }),
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
