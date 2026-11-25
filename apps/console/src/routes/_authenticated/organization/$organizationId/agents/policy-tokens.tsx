import { createFileRoute } from '@tanstack/react-router'
import { AgentExperiencePolicyTokens } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agents/policy-tokens')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AgentExperiencePolicyTokens />
}
