import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'
import { serviceCreateParamsSchema } from '@qovery/shared/router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/helm/'
)({
  component: RouteComponent,
  validateSearch: serviceCreateParamsSchema,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const search = Route.useSearch()

  return (
    <Navigate
      to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/helm/general"
      params={{ organizationId, projectId, environmentId }}
      search={search}
      replace
    />
  )
}
