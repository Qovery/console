import { createFileRoute } from '@tanstack/react-router'
import { EnvironmentPipeline } from '@qovery/domains/environment-logs/feature'
import { Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/deployment/$deploymentId/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Deployment details')

  return (
    <div className="container mx-auto flex min-h-page-container flex-col pt-6">
      <Section className="min-h-0 flex-1 gap-8">
        <div className="flex min-h-0 flex-1 flex-col gap-8 pb-20">
          <EnvironmentPipeline />
        </div>
      </Section>
    </div>
  )
}
