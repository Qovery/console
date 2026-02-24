import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/settings/roles/edit/$roleId/edit-role',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/_authenticated/organization/$organizationId/settings/roles/edit/$roleId/edit-role"!
    </div>
  )
}
