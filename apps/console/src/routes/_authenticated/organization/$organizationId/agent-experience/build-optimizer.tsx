import { createFileRoute } from '@tanstack/react-router'
import { AgentExperienceBuildOptimizer } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience/build-optimizer')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AgentExperienceBuildOptimizer />
}
