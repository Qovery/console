import { createFileRoute } from '@tanstack/react-router'
import { SettingsAgentMcps } from '@qovery/domains/organizations/feature'
import { AgentTasksGate } from '@qovery/domains/skill-presets/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/agent-experience/mcp-servers')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AgentTasksGate>
      <SettingsAgentMcps />
    </AgentTasksGate>
  )
}
