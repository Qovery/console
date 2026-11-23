import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { OrganizationDomains } from '@qovery/domains/service-settings/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/domains')({
  component: OrganizationDomains,
  validateSearch: z.object({ page: z.number().int().min(1).optional().catch(undefined) }),
})
