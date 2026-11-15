import { createFileRoute } from '@tanstack/react-router'
import { SkillPresetEditor } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/settings/skill-presets/$skillPresetId/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <SkillPresetEditor />
}
