import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/audit-logs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <p className="text-neutral">Audit Logs</p>
}
