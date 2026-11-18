import { createFileRoute } from '@tanstack/react-router'
import { AgentExperienceOverview } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AgentExperienceOverview />
}
