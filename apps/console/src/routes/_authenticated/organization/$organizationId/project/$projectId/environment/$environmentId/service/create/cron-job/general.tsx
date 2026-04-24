import { createFileRoute } from '@tanstack/react-router'
import { StepGeneral } from '@qovery/domains/service-job/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/cron-job/general'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('General - Create Cron Job')

  return <StepGeneral />
}
