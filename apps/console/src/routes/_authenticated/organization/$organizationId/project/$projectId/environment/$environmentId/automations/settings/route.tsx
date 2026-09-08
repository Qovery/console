import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automations/settings'
)({ component: RouteComponent })

function RouteComponent() {
  return <Outlet />
}
