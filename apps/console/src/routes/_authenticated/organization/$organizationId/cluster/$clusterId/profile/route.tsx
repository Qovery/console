import { Navigate, Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { z } from 'zod'
import { LoaderSpinner } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/profile')({
  component: RouteComponent,
  validateSearch: z.object({ search: z.string().optional() }),
})

function RouteComponent() {
  useDocumentTitle('Cluster - Profile')
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  // Undefined until PostHog has loaded the flags: redirecting then would turn away users who have access.
  const isProfileEnabled = useFeatureFlagEnabled('engine-v2-platform-configuration')

  if (isProfileEnabled === undefined) {
    return (
      <div className="flex min-h-page-container items-center justify-center">
        <LoaderSpinner />
      </div>
    )
  }

  if (!isProfileEnabled && organizationId && clusterId) {
    return (
      <Navigate
        to="/organization/$organizationId/cluster/$clusterId/overview"
        params={{ organizationId, clusterId }}
        replace
      />
    )
  }

  return <Outlet />
}
