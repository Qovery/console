import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/infrastructure/')({
  component: InfrastructureIndex,
})

function InfrastructureIndex() {
  const { organizationId } = useParams({ strict: false })

  if (!organizationId) {
    return null
  }

  return <Navigate to="/organization/$organizationId/infrastructure/overview" params={{ organizationId }} replace />
}
