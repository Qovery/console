import { createFileRoute } from '@tanstack/react-router'
import { AgentActivity } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/agent-activity')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AgentActivity />
}
