import { createFileRoute } from '@tanstack/react-router'
import { AgentExperienceAutomations } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agents/automations')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AgentExperienceAutomations />
}
