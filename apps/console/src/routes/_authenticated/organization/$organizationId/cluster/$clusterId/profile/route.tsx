import { Navigate, Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { z } from 'zod'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/profile')({
  component: RouteComponent,
  validateSearch: z.object({ search: z.string().optional() }),
})

function RouteComponent() {
  useDocumentTitle('Cluster - Profile')
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const isProfileEnabled = Boolean(useFeatureFlagEnabled('engine-v2-platform-configuration'))

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
