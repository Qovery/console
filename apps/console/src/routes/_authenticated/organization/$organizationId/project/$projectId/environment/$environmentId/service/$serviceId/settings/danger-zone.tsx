import { createFileRoute } from '@tanstack/react-router'
import { ServiceDangerZoneSettings } from '@qovery/domains/service-settings/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/danger-zone'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, projectId, environmentId } = Route.useParams()
  const navigate = Route.useNavigate()

  return (
    <ServiceDangerZoneSettings
      onDeleteSuccess={() =>
        navigate({
          to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
          params: {
            organizationId,
            projectId,
            environmentId,
          },
        })
      }
    />
  )
}
