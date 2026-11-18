import { createFileRoute } from '@tanstack/react-router'
import { SkillPresetsPreview } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/agent-experience/skill-presets/preview'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <SkillPresetsPreview />
}
