import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/billing-details')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/organization/$organizationId/settings/billing-details"!</div>
}
