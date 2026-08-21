import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import {
  TerraformVariablesProvider,
  TerraformVariablesTable,
  useTerraformVariablesContext,
} from '@qovery/domains/service-terraform/feature'
import { type Terraform } from '@qovery/domains/services/data-access'
import { type TerraformGeneralData, useEditService, useService } from '@qovery/domains/services/feature'
import { Button, LoaderSpinner } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildEditServicePayload } from '@qovery/shared/util-services'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables/terraform'
)({
  component: RouteComponent,
})

const TerraformVariablesLoader = () => (
  <div className="flex h-64 items-center justify-center">
    <LoaderSpinner className="w-6" />
  </div>
)

const TerraformVariablesForm = ({ service }: { service: Terraform }) => {
  const { organizationId, projectId, environmentId } = Route.useParams()
  const { handleSubmit } = useFormContext<TerraformGeneralData>()
  const { serializeForApi, tfVarFiles, errors } = useTerraformVariablesContext()
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const onSubmit = handleSubmit(() => {
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
    <div className="bg-background">
      <TerraformVariablesTable className="rounded-none border-0" />
      <div className="flex justify-end border-t border-neutral p-4">
        <Button type="submit" size="lg" onClick={onSubmit} loading={isLoadingEditService} disabled={errors.size > 0}>
          Save
        </Button>
      </div>
    </div>
  )
}

const TerraformVariablesContent = ({ service }: { service: Terraform }) => {
  const methods = useForm<TerraformGeneralData>({
    mode: 'onChange',
    defaultValues: match(service)
      .with({ serviceType: 'TERRAFORM' }, (terraformService) => terraformService)
      .otherwise(() => ({})),
  })

  return (
    <FormProvider {...methods}>
      <TerraformVariablesProvider>
        <TerraformVariablesForm service={service} />
      </TerraformVariablesProvider>
    </FormProvider>
  )
}

function RouteComponent() {
  const { environmentId, serviceId } = Route.useParams()
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  useDocumentTitle('Terraform variables - Service')

  if (service?.serviceType !== 'TERRAFORM') {
    return null
  }

  return (
    <Suspense fallback={<TerraformVariablesLoader />}>
      <TerraformVariablesContent service={service} />
    </Suspense>
  )
}
