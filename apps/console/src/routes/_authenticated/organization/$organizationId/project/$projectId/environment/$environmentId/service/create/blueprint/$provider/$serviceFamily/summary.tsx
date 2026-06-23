import { createFileRoute } from '@tanstack/react-router'
import { BlueprintStepSummary } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/blueprint/$provider/$serviceFamily/summary'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Summary - Create Blueprint')

  return <BlueprintStepSummary />
}
