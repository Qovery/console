import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/notifications')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
