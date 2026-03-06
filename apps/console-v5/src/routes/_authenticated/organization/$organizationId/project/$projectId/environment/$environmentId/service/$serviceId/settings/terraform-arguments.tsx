import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/terraform-arguments'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="px-10 py-7">Terraform arguments</div>
}
