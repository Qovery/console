import { createFileRoute } from '@tanstack/react-router'
import { EnvironmentDeploymentList } from '@qovery/domains/environments/feature'
import { Heading, Section } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/deployments'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="container mx-auto flex min-h-page-container flex-col pt-6">
      <Section className="min-h-0 flex-1 gap-8">
        <div className="flex shrink-0 flex-col gap-6">
          <div className="flex justify-between">
            <Heading>Deployments</Heading>
          </div>
          <hr className="w-full border-neutral" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-8 pb-20">
          <EnvironmentDeploymentList />
        </div>
      </Section>
    </div>
  )
}
