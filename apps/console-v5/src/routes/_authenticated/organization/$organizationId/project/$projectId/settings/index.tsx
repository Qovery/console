import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/project/$projectId/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { projectId } = useParams({ strict: false })

  if (!projectId) {
    return null
  }

  return (
    <Navigate to="/organization/$organizationId/project/$projectId/settings/general" params={{ projectId }} replace />
  )
}
