import { createFileRoute } from '@tanstack/react-router'
import { AuditLogsFeature } from '@qovery/domains/audit-logs/feature'
import { auditLogsParamsSchema } from '@qovery/shared/router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/audit-logs')({
  component: RouteComponent,
  validateSearch: auditLogsParamsSchema,
})

function RouteComponent() {
  return <AuditLogsFeature />
}
