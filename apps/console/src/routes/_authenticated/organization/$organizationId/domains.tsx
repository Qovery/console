import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { OrganizationDomains } from '@qovery/domains/service-settings/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/domains')({
  component: OrganizationDomains,
  validateSearch: z.object({
    page: z.number().int().min(1).optional().catch(undefined),
    // Only the sizes offered by the pagination select.
    pageSize: z
      .union([z.literal(10), z.literal(30), z.literal(50), z.literal(100)])
      .optional()
      .catch(undefined),
  }),
})
