import { createFileRoute } from '@tanstack/react-router'
import { GeneralSettingsPage } from '@qovery/domains/service-settings/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/general'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, projectId, environmentId, serviceId } = Route.useParams()

  return (
    <GeneralSettingsPage
      organizationId={organizationId}
      projectId={projectId}
      environmentId={environmentId}
      serviceId={serviceId}
    />
  )
}
