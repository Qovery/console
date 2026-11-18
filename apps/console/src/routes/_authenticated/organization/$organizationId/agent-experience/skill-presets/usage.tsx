import { createFileRoute } from '@tanstack/react-router'
import { SkillPresetUsage } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/agent-experience/skill-presets/usage'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <SkillPresetUsage />
}
