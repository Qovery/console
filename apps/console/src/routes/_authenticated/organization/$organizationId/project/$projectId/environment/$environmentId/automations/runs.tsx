import { createFileRoute, useParams } from '@tanstack/react-router'
import { AgentTaskRuns } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Link, Section } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automations/runs'
)({ component: RouteComponent })

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  return (
    <Section className="px-8 pb-8 pt-6">
      <Link
        className="mb-4"
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/automations"
        params={{ organizationId, projectId, environmentId }}
      >
        ← Back to Automations
      </Link>
      <SettingsHeading title="Runs" description="Monitor your agent task executions." />
      <AgentTaskRuns grouped />
    </Section>
  )
}
