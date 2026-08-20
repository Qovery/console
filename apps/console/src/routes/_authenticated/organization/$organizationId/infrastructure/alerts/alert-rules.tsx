import { createFileRoute } from '@tanstack/react-router'
import { OrganizationAlerting } from '@qovery/domains/observability/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/infrastructure/alerts/alert-rules')({
  component: AlertRulesComponent,
})

function AlertRulesComponent() {
  return <OrganizationAlerting />
}
