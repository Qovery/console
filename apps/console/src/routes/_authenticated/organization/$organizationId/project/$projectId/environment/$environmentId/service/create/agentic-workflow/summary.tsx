import { createFileRoute } from '@tanstack/react-router'
import { AgenticWorkflowSummary } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/agentic-workflow/summary'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Summary - Create agentic workflow')

  return <AgenticWorkflowSummary />
}
