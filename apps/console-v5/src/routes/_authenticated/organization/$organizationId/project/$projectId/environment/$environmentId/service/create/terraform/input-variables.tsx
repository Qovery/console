import { createFileRoute } from '@tanstack/react-router'
import { TerraformStepVariables } from '@qovery/domains/service-terraform/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/input-variables'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Terraform variables - Create Terraform')

  return <TerraformStepVariables />
}
