import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })

  return (
    <Navigate
      to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview"
      params={{ organizationId, projectId, environmentId, serviceId }}
      replace
    />
  )
}
