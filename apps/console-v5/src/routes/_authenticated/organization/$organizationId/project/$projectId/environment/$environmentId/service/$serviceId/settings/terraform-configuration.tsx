import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import {
  TerraformConfigurationSettings,
  buildDockerfileFragment,
  extractDockerfileFragmentFields,
} from '@qovery/domains/service-settings/feature'
import { type TerraformGeneralData, useEditService, useService } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, LoaderSpinner, Section } from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/terraform-configuration'
)({
  component: RouteComponent,
})

const TerraformConfigurationLoader = () => (
  <div className="flex min-h-page-container items-center justify-center">
    <LoaderSpinner />
  </div>
)

const TerraformConfigurationSettingsWrapper = () => {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = Route.useParams()
  const { data: service } = useService({ serviceId, suspense: true })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const methods = useForm<TerraformGeneralData>({
    mode: 'onChange',
    defaultValues: match(service)
      .with({ serviceType: 'TERRAFORM' }, (s) => ({
        ...s,
        ...extractDockerfileFragmentFields(s.dockerfile_fragment),
      }))
      .otherwise(() => ({})),
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (!service || !data) return

    if (service.serviceType === 'TERRAFORM') {
      const payload = {
        ...data,
        timeout_sec: Number(data.timeout_sec ?? service.timeout_sec),
        dockerfile_fragment: buildDockerfileFragment(data),
      }

      editService({
        serviceId: service.id,
        payload: buildEditServicePayload({ service, request: payload }),
      })
    }
  })

  return (
    <FormProvider {...methods}>
      <Section className="px-8 pb-8 pt-6">
        <SettingsHeading
          title="Terraform configuration"
          description="Customize the resources assigned to the service."
        />
        <div className="max-w-content-with-navigation-left">
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
        </div>
      </Section>
    </FormProvider>
  )
}

function RouteComponent() {
  return (
    <Suspense fallback={<TerraformConfigurationLoader />}>
      <TerraformConfigurationSettingsWrapper />
    </Suspense>
  )
}
