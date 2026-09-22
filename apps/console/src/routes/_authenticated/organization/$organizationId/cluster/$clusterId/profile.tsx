import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { z } from 'zod'
import { ClusterProfileFeature, ENGINE_V2_PLATFORM_CONFIGURATION_FEATURE_FLAG } from '@qovery/domains/clusters/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/profile')({
  component: RouteComponent,
  validateSearch: z.object({
    component: z.string().optional(),
  }),
})

function RouteComponent() {
  useDocumentTitle('Cluster - Profile')
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const { component } = Route.useSearch()
  const navigate = Route.useNavigate()
  const isProfileEnabled = Boolean(useFeatureFlagEnabled(ENGINE_V2_PLATFORM_CONFIGURATION_FEATURE_FLAG))

  if (!isProfileEnabled && organizationId && clusterId) {
    return (
      <Navigate
        to="/organization/$organizationId/cluster/$clusterId/overview"
        params={{ organizationId, clusterId }}
        replace
      />
    )
  }

  return (
    <ClusterProfileFeature
      organizationId={organizationId}
      activeComponentKey={component}
      onActiveComponentChange={(nextComponent) => navigate({ search: { component: nextComponent } })}
    />
  )
}
