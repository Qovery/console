import { createFileRoute } from '@tanstack/react-router'
import { AgenticWorkflowConfiguration } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/agentic-workflow/configuration'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Agentic workflow configuration')

  return <AgenticWorkflowConfiguration />
}
