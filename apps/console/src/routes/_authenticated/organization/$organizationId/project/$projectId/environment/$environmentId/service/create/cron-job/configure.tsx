import { createFileRoute } from '@tanstack/react-router'
import { StepConfigure } from '@qovery/domains/service-job/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/cron-job/configure'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Configure - Create Cron Job')

  return <StepConfigure />
}
