import { createFileRoute } from '@tanstack/react-router'
import { TerraformArgumentsSettings } from '@qovery/domains/service-settings/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/terraform-arguments'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <TerraformArgumentsSettings />
}
