import { createFileRoute } from '@tanstack/react-router'
import { AgenticWorkflowSettings } from '@qovery/domains/service-settings/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/governance'
)({ component: () => <AgenticWorkflowSettings page="governance" /> })
