import { createFileRoute } from '@tanstack/react-router'
import { StepSummary } from '@qovery/domains/service-job/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/cron-job/summary'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Summary - Create Cron Job')

  return <StepSummary />
}
