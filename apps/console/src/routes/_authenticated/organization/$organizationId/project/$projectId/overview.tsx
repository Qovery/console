import { createFileRoute } from '@tanstack/react-router'
import { EnvironmentsTable } from '@qovery/domains/environments/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/project/$projectId/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EnvironmentsTable />
}
