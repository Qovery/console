import { createFileRoute } from '@tanstack/react-router'
import { ApplicationContainerPortSettings } from '@qovery/domains/service-settings/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/port'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Port - Service settings')

  return <ApplicationContainerPortSettings />
}
