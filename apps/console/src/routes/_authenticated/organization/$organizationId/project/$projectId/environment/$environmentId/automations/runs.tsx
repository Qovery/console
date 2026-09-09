import { createFileRoute } from '@tanstack/react-router'
import { AgentTaskRuns } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Section } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automations/runs'
)({ component: RouteComponent })

function RouteComponent() {
  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading title="Runs" description="Monitor your agent task executions." />
      <AgentTaskRuns />
    </Section>
  )
}
