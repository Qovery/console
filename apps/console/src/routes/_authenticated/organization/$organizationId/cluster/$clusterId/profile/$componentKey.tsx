import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'
import { ClusterProfileFeature, resolveProfileSelection, useClusterProfileTree } from '@qovery/domains/clusters/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/cluster/$clusterId/profile/$componentKey'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const { componentKey } = Route.useParams()
  const { search } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { profileTree, isLoading } = useClusterProfileTree({ organizationId, clusterId })
  // Disabled layers and components with nothing to configure cannot be opened: the URL follows what is displayed.
  const resolvedComponentKey = resolveProfileSelection(profileTree, componentKey).component?.key

  if (!isLoading && resolvedComponentKey && resolvedComponentKey !== componentKey) {
    return (
      <Navigate
        to="/organization/$organizationId/cluster/$clusterId/profile/$componentKey"
        params={{ organizationId, clusterId, componentKey: resolvedComponentKey }}
        search={(previous) => previous}
        replace
      />
    )
  }

  return (
    <ClusterProfileFeature
      // The route is reused across clusters: remount so unsaved edits never carry over to another cluster.
      key={clusterId}
      activeComponentKey={componentKey}
      search={search}
      onActiveComponentChange={(nextComponentKey) =>
        navigate({
          to: '/organization/$organizationId/cluster/$clusterId/profile/$componentKey',
          params: (previous) => ({ ...previous, componentKey: nextComponentKey }),
          search: (previous) => previous,
        })
      }
      onSearchChange={(nextSearch) =>
        navigate({ search: (previous) => ({ ...previous, search: nextSearch || undefined }), replace: true })
      }
    />
  )
}
