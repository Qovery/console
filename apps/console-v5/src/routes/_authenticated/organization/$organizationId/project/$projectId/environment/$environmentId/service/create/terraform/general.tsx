import { createFileRoute } from '@tanstack/react-router'
import { StepGeneral } from '@qovery/domains/service-terraform/feature'
import { serviceCreateParamsSchema } from '@qovery/shared/router'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/general'
)({
  component: General,
  validateSearch: serviceCreateParamsSchema,
})

function General() {
  useDocumentTitle('General - Create Terraform')

  return <StepGeneral />
}
