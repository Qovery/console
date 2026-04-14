import { createFileRoute } from '@tanstack/react-router'
import { TerraformStepSummary } from '@qovery/domains/service-terraform/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/summary'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Summary - Create Terraform')

  return <TerraformStepSummary />
}
