import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <p className="text-neutral">Settings</p>
}
