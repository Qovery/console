import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/infrastructure/project/$projectId/settings/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { projectId = '', organizationId = '' } = useParams({ strict: false })

  if (!projectId) {
    return null
  }

  return (
    <Navigate
      to="/organization/$organizationId/infrastructure/project/$projectId/settings/general"
      params={{ organizationId, projectId }}
      replace
    />
  )
}
