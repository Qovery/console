import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'
import { ClusterProfileFeature, resolveProfileSelection, useClusterProfileTree } from '@qovery/domains/clusters/feature'
import { LoaderSpinner } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const { profileTree, isLoading, isError } = useClusterProfileTree({ organizationId, clusterId })
  const componentKey = resolveProfileSelection(profileTree).component?.key

  if (isLoading) {
    return (
      <div className="flex min-h-page-container items-center justify-center">
        <LoaderSpinner />
      </div>
    )
  }

  // Without a component to open, the feature shows the error or empty state.
  if (isError || !componentKey) {
    return <ClusterProfileFeature key={clusterId} />
  }

  return (
    <Navigate
      to="/organization/$organizationId/cluster/$clusterId/profile/$componentKey"
      params={{ organizationId, clusterId, componentKey }}
      search={(previous) => previous}
      replace
    />
  )
}
