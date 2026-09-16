import { createFileRoute } from '@tanstack/react-router'
import { SettingsAgentTokens } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/agents/tokens')({
  component: SettingsAgentTokens,
})
