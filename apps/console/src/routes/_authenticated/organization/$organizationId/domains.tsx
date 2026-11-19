import { createFileRoute } from '@tanstack/react-router'
import { OrganizationDomains } from '@qovery/domains/service-settings/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/domains')({
  component: OrganizationDomains,
})
