import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/cron-job/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = Route.useParams()
  const search = Route.useSearch()

  return (
    <Navigate
      to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/cron-job/general"
      params={{ organizationId, projectId, environmentId }}
      search={search}
      replace
    />
  )
}
