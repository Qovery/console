import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = Route.useParams()
  // TODO: Implement the index route (with introduction view)

  return (
    <Navigate
      to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/general"
      params={{ organizationId, projectId, environmentId }}
      replace
    />
  )
}
