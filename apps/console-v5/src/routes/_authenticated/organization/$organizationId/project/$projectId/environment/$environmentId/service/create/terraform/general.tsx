import { createFileRoute } from '@tanstack/react-router'
import { TerraformStepGeneral } from '@qovery/domains/service-terraform/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/general'
)({
  component: General,
})

function General() {
  useDocumentTitle('General - Create Terraform')

  return <TerraformStepGeneral />
}
