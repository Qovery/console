import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/infrastructure')({
  component: InfrastructureRoute,
})

function InfrastructureRoute() {
  return <Outlet />
}
