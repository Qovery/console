import { createFileRoute } from '@tanstack/react-router'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { EmptyState, Section } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automations/runs'
)({ component: RouteComponent })

function RouteComponent() {
  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading title="Runs" description="Monitor your agent task executions." />
      <div className="max-w-content-with-navigation-left">
        <EmptyState
          title="No automation runs yet"
          description="Runs will appear here when an environment automation executes."
        />
      </div>
    </Section>
  )
}
