import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BlueprintUpdatePreviewStep } from '@qovery/domains/services/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/update/blueprint/preview'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, projectId, environmentId, serviceId } = Route.useParams()
  const navigate = useNavigate()

  return (
    <BlueprintUpdatePreviewStep
      onBack={() => {
        navigate({
          to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/update/blueprint',
          params: { organizationId, projectId, environmentId, serviceId },
        })
      }}
    />
  )
}
