import { createFileRoute } from '@tanstack/react-router'
import { SettingsAgentMcps } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/agents/mcps')({
  component: SettingsAgentMcps,
})
