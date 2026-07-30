import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/agentic-workflow/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, projectId, environmentId } = Route.useParams()

  return (
    <Navigate
      to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/agentic-workflow/configuration"
      params={{ organizationId, projectId, environmentId }}
      replace
    />
  )
}
