import { createFileRoute } from '@tanstack/react-router'
import { CustomTab } from '@qovery/domains/services/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <CustomTab />
}
