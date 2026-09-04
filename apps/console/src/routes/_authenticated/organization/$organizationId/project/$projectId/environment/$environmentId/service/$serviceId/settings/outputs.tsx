import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/outputs'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()

  return (
    <Navigate
      to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/automations"
      params={params}
      replace
    />
  )
}
