import { createFileRoute } from '@tanstack/react-router'
import { AuditLogsFeature, auditLogsParamsSchema } from '@qovery/domains/audit-logs/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/audit-logs')({
  component: RouteComponent,
  validateSearch: auditLogsParamsSchema,
})

function RouteComponent() {
  return <AuditLogsFeature />
}
