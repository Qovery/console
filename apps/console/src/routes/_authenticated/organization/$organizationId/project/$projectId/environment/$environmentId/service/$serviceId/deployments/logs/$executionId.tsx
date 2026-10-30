import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { DeploymentLogs, DeploymentLogsLoader } from '@qovery/domains/service-logs/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Suspense fallback={<DeploymentLogsLoader />}>
      <DeploymentLogs />
    </Suspense>
  )
}
