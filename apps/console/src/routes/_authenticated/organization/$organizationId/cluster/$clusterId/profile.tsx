import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { z } from 'zod'
import { ClusterProfileFeature } from '@qovery/domains/clusters/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/profile')({
  component: RouteComponent,
  validateSearch: z.object({
    component: z.string().optional(),
    search: z.string().optional(),
  }),
})

function RouteComponent() {
  useDocumentTitle('Cluster - Profile')
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const { component, search } = Route.useSearch()
  const navigate = Route.useNavigate()
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

  return (
    <ClusterProfileFeature
      // The route is reused across clusters: remount so unsaved edits never carry over to another cluster.
      key={clusterId}
      activeComponentKey={component}
      search={search}
      onActiveComponentChange={(nextComponent) =>
        navigate({ search: (previous) => ({ ...previous, component: nextComponent }) })
      }
      onSearchChange={(nextSearch) =>
        navigate({ search: (previous) => ({ ...previous, search: nextSearch || undefined }), replace: true })
      }
    />
  )
}
