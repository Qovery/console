import { createFileRoute } from '@tanstack/react-router'
import { ServiceDeploymentRestrictionsSettings } from '@qovery/domains/service-settings/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/deployment-restrictions'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Deployment restrictions - Service settings')

  return <ServiceDeploymentRestrictionsSettings />
}
