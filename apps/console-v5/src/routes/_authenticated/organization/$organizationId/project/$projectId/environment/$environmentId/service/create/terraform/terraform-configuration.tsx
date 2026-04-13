import { createFileRoute } from '@tanstack/react-router'
import { StepTerraformConfiguration } from '@qovery/domains/service-terraform/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/terraform-configuration'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Terraform configuration - Create Terraform')

  return <StepTerraformConfiguration />
}
