import { createFileRoute } from '@tanstack/react-router'
import { BuiltInTab } from '@qovery/domains/services/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables/built-in'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <BuiltInTab />
}
