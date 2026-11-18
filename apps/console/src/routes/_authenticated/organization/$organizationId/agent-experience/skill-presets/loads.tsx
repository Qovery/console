import { createFileRoute } from '@tanstack/react-router'
import { SkillLoads } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/agent-experience/skill-presets/loads'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <SkillLoads />
}
