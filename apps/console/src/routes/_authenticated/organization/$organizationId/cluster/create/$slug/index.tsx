import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/create/$slug/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', slug = 'new' } = useParams({ strict: false })

  return (
    <Navigate
      to="/organization/$organizationId/cluster/create/$slug/general"
      params={{ organizationId, slug }}
      replace
    />
  )
}
