import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/values-override-arguments'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="px-10 py-7">Values override arguments</div>
}
