import { createFileRoute } from '@tanstack/react-router'
import { AgentActivity, activitySearchSchema } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience/agent-activity')({
  validateSearch: activitySearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  return <AgentActivity />
}
