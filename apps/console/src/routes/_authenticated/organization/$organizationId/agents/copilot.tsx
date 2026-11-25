import { createFileRoute } from '@tanstack/react-router'
import { AgentExperienceCopilot } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agents/copilot')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AgentExperienceCopilot />
}
