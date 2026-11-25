import { createFileRoute } from '@tanstack/react-router'
import { SettingsAgentTokens } from '@qovery/domains/organizations/feature'
import { AgentTasksGate } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agents/agent-task-tokens')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AgentTasksGate>
      <SettingsAgentTokens />
    </AgentTasksGate>
  )
}
