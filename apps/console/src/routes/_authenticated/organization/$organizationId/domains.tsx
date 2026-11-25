import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { z } from 'zod'
import { OrganizationDomains } from '@qovery/domains/service-settings/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/domains')({
  component: RouteComponent,
  validateSearch: z.object({
    page: z.number().int().min(1).optional().catch(undefined),
    // Only the sizes offered by the pagination select.
    pageSize: z
      .union([z.literal(10), z.literal(30), z.literal(50), z.literal(100)])
      .optional()
      .catch(undefined),
  }),
})

function RouteComponent() {
  const params = Route.useParams()
  const enabled = Boolean(useFeatureFlagEnabled('organization-domains'))
  if (!enabled) return <Navigate to="/organization/$organizationId/overview" params={params} replace />
  return <OrganizationDomains />
}
