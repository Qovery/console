import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import {
  EnvironmentDeploymentList,
  EnvironmentDeploymentListSkeleton,
  getFakeArgoCdMode,
} from '@qovery/domains/environments/feature'
import { Heading, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/deployments'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { environmentId } = Route.useParams()
  useDocumentTitle('Deployment history')
  const shouldShowArgoCdDescription = getFakeArgoCdMode(environmentId) !== 'none'

  return (
    <div className="container mx-auto flex min-h-page-container flex-col pt-6">
      <Section className="min-h-0 flex-1 gap-8">
        <div className="flex shrink-0 flex-col gap-6">
          <div className="flex justify-between">
            <Heading>Deployments</Heading>
          </div>
          <hr className="w-full border-neutral" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 pb-20">
          {shouldShowArgoCdDescription ? (
            <div className="flex flex-col gap-1">
              <Heading level={3} className="text-neutral">
                Last deployments
              </Heading>
              <p className="text-sm text-neutral-subtle">
                Only deployments of Qovery services are shown here. Deployments performed through ArgoCD are not
                tracked.
              </p>
            </div>
          ) : null}
          <Suspense fallback={<EnvironmentDeploymentListSkeleton />}>
            <EnvironmentDeploymentList />
          </Suspense>
        </div>
      </Section>
    </div>
  )
}
