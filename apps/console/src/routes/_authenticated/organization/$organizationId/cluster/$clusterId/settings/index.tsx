import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, clusterId } = useParams({ strict: false })

  if (!organizationId || !clusterId) {
    return null
  }

  return (
    <Navigate
      to="/organization/$organizationId/cluster/$clusterId/settings/general"
      params={{ organizationId, clusterId }}
      replace
    />
  )
}
