import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { DeploymentLogs } from '@qovery/domains/service-logs/feature'
import { LoaderPlaceholder } from '@qovery/domains/service-logs/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-116px)] w-full flex-col justify-center">
          <LoaderPlaceholder />
        </div>
      }
    >
      <DeploymentLogs />
    </Suspense>
  )
}
