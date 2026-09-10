import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/settings/preview-environments'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  return (
    <Navigate
      to="/organization/$organizationId/project/$projectId/environment/$environmentId/automations/settings/preview-environments"
      params={{ organizationId, projectId, environmentId }}
      replace
    />
  )
}
