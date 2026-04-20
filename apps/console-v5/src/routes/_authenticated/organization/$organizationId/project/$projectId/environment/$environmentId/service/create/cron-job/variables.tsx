import { createFileRoute } from '@tanstack/react-router'
import { StepVariables } from '@qovery/domains/service-job/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/cron-job/variables'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Variables - Create Cron Job')

  return <StepVariables />
}
