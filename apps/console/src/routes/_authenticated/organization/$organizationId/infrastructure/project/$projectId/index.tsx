import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/infrastructure/project/$projectId/')(
  {
    component: RouteComponent,
  }
)

function RouteComponent() {
  const { organizationId = '', projectId = '' } = useParams({ strict: false })

  return (
    <Navigate
      to="/organization/$organizationId/infrastructure/project/$projectId/overview"
      params={{ organizationId, projectId }}
      replace
    />
  )
}
