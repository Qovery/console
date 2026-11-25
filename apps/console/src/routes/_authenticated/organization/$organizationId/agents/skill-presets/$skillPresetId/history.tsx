import { createFileRoute } from '@tanstack/react-router'
import { SkillPresetHistory } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/agents/skill-presets/$skillPresetId/history'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <SkillPresetHistory />
}
