import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { TerraformVariablesTable } from '@qovery/domains/service-settings/feature'
import { TerraformVariablesProvider, useTerraformVariablesContext } from '@qovery/domains/service-terraform/feature'
import { type Terraform } from '@qovery/domains/services/data-access'
import { type TerraformGeneralData, useEditService, useService } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, LoaderSpinner, Section } from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/terraform-variables'
)({
  component: RouteComponent,
})

const TerraformVariablesLoader = () => (
  <div className="flex min-h-page-container items-center justify-center">
    <LoaderSpinner />
  </div>
)

const TerraformVariablesSettingsForm = ({ service }: { service: Terraform }) => {
  const { organizationId = '', projectId = '', environmentId = '' } = Route.useParams()
  const { handleSubmit } = useFormContext<TerraformGeneralData>()
  const { serializeForApi, tfVarFiles, errors } = useTerraformVariablesContext()

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
      serviceId: service.id,
      payload,
    })
  })

  return (
    <>
      <TerraformVariablesTable />
      <div className="mt-10 flex justify-end">
        <Button type="submit" size="lg" onClick={onSubmit} loading={isLoadingEditService} disabled={errors.size > 0}>
          Save
        </Button>
      </div>
    </>
  )
}

const TerraformVariablesContent = ({ service }: { service: Terraform }) => {
  const methods = useForm<TerraformGeneralData>({
    mode: 'onChange',
    defaultValues: match(service)
      .with({ serviceType: 'TERRAFORM' }, (s) => s)
      .otherwise(() => ({})),
  })

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading
        title="Terraform variables"
        description="Select .tfvars files and configure variable values for your Terraform deployment"
      />
      <div className="w-full">
        <FormProvider {...methods}>
          <TerraformVariablesProvider>
            <TerraformVariablesSettingsForm service={service} />
          </TerraformVariablesProvider>
        </FormProvider>
      </div>
    </Section>
  )
}

const TerraformVariablesWrapper = () => {
  const { serviceId } = useParams({ strict: false })
  const { data: service } = useService({ serviceId })

  if (service?.serviceType !== 'TERRAFORM') {
    return null
  }

  return <TerraformVariablesContent service={service} />
}

function RouteComponent() {
  return (
    <Suspense fallback={<TerraformVariablesLoader />}>
      <TerraformVariablesWrapper />
    </Suspense>
  )
}
