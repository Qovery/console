import { createFileRoute } from '@tanstack/react-router'
import { TerraformStepVariables } from '@qovery/domains/service-terraform/feature'
import { serviceCreateParamsSchema } from '@qovery/shared/router'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/input-variables'
)({
  component: RouteComponent,
  validateSearch: serviceCreateParamsSchema,
})

function RouteComponent() {
  useDocumentTitle('Terraform variables - Create Terraform')

  return <TerraformStepVariables />
}
