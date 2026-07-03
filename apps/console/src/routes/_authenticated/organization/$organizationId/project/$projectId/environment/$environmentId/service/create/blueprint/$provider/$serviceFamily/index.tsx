import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/blueprint/$provider/$serviceFamily/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, projectId, environmentId, provider, serviceFamily } = Route.useParams()

  return (
    <Navigate
      to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/blueprint/$provider/$serviceFamily/service-information"
      params={{ organizationId, projectId, environmentId, provider, serviceFamily }}
      replace
    />
  )
}
