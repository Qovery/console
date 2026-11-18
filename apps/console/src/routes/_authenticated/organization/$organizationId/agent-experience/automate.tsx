import { createFileRoute } from '@tanstack/react-router'
import { AgentExperienceAutomate } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience/automate')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AgentExperienceAutomate />
}
