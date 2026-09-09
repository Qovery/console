import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automations'
)({
  component: () => (
    <div className="min-w-0 flex-1">
      <Outlet />
    </div>
  ),
})
