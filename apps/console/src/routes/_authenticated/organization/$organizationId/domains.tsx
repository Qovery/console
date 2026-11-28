import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { z } from 'zod'
import { OrganizationDomains } from '@qovery/domains/service-settings/feature'
import { LoaderSpinner } from '@qovery/shared/ui'

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
  // `undefined` until PostHog has loaded the flags: wait instead of redirecting a user who has the flag.
  const enabled = useFeatureFlagEnabled('organization-domains')
  if (enabled === undefined)
    return (
      <div className="container mx-auto mt-6 flex justify-center py-12">
        <LoaderSpinner />
      </div>
    )
  if (!enabled) return <Navigate to="/organization/$organizationId/overview" params={params} replace />
  return <OrganizationDomains />
}
