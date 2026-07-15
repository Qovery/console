import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BlueprintUpdateReviewStep } from '@qovery/domains/services/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/update/blueprint/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, projectId, environmentId, serviceId } = Route.useParams()
  const navigate = useNavigate()

  return (
    <BlueprintUpdateReviewStep
      onContinue={() => {
        navigate({
          to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/update/blueprint/preview',
          params: { organizationId, projectId, environmentId, serviceId },
        })
      }}
    />
  )
}
