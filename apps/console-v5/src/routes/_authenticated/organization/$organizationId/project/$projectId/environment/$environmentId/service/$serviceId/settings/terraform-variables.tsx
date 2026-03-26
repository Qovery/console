import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { TerraformVariablesProvider, TerraformVariablesTable } from '@qovery/domains/service-settings/feature'
import { type TerraformGeneralData, useService } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { LoaderSpinner, Section } from '@qovery/shared/ui'

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

const TerraformVariablesWrapper = () => {
  const { serviceId } = useParams({ strict: false })
  const { data: service } = useService({ serviceId })
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
      <div className="max-w-content-with-navigation-left">
        <FormProvider {...methods}>
          <TerraformVariablesProvider>
            <TerraformVariablesTable />
          </TerraformVariablesProvider>
        </FormProvider>
      </div>
    </Section>
  )
}

function RouteComponent() {
  return (
    <Suspense fallback={<TerraformVariablesLoader />}>
      <TerraformVariablesWrapper />
    </Suspense>
  )
}
