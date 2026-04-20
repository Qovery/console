import { createFileRoute } from '@tanstack/react-router'
import { StepIntroduction } from '@qovery/domains/service-job/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/introduction'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Introduction - Create Job')

  return <StepIntroduction />
}
