import { createFileRoute } from '@tanstack/react-router'
import { ApplicationContainerHealthchecksSettings } from '@qovery/domains/service-settings/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/health-checks'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Health checks - Service settings')

  return <ApplicationContainerHealthchecksSettings />
}
