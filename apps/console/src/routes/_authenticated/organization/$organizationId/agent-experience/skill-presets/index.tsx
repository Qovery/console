import { createFileRoute } from '@tanstack/react-router'
import { SettingsSkillPresets } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience/skill-presets/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsSkillPresets />
}
