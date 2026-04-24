import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'
import { serviceCreateParamsSchema } from '@qovery/shared/router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/$slug/'
)({
  component: RouteComponent,
  validateSearch: serviceCreateParamsSchema,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '', slug = '' } = useParams({ strict: false })
  const search = Route.useSearch()

  return (
    <Navigate
      to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/$slug/general"
      params={{ organizationId, projectId, environmentId, slug }}
      search={search}
      replace
    />
  )
}
