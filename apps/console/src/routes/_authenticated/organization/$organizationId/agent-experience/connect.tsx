import { createFileRoute } from '@tanstack/react-router'
import { AgentExperienceConnect } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience/connect')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AgentExperienceConnect />
}
