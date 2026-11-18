import { createFileRoute } from '@tanstack/react-router'
import { SkillPresetAssignments } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/agent-experience/skill-presets/assignments'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <SkillPresetAssignments />
}
