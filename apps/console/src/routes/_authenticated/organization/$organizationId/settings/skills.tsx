import { createFileRoute } from '@tanstack/react-router'
import { SettingsAiSkills } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/skills')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsAiSkills />
}
