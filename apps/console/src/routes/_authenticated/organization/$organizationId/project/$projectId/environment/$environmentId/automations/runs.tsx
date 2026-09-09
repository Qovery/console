import { createFileRoute, useParams } from '@tanstack/react-router'
import { AgentTaskRuns } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Icon, Link, Section } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automations/runs'
)({ component: RouteComponent })

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  return (
    <Section className="pb-8 pt-6">
      <Link
        className="mb-2 gap-1"
        color="brand"
        size="xs"
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/automations"
        params={{ organizationId, projectId, environmentId }}
      >
        <Icon iconName="arrow-left" className="text-2xs" />
        Back to Automations
      </Link>
      <SettingsHeading title="Runs" description="Monitor your agent task executions." />
      <AgentTaskRuns grouped />
    </Section>
  )
}
