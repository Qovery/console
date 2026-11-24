import { createFileRoute } from '@tanstack/react-router'
import { AgentExperienceAutomations } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience/automate')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AgentExperienceAutomations />
}
