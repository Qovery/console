import { createFileRoute } from '@tanstack/react-router'
import { PageEnvironmentLogs } from '@qovery/pages/logs/environment'
import { serviceLogsParamsSchema } from '@qovery/shared/router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/service-logs'
)({
  component: RouteComponent,
  validateSearch: serviceLogsParamsSchema,
})

function RouteComponent() {
  return <PageEnvironmentLogs />
}
