import { createFileRoute, useParams } from '@tanstack/react-router'
import { ClusterWorkloads, useClusterMetricsSocket } from '@qovery/domains/cluster-metrics/feature'
import { ErrorBoundary, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/workloads')({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Cluster - Workloads')
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })

  useClusterMetricsSocket({ organizationId, clusterId })

  if (!organizationId || !clusterId) {
    return null
  }

  return (
    <ErrorBoundary>
      <Section className="gap-8 pb-20 pt-6">
        <ClusterWorkloads organizationId={organizationId} clusterId={clusterId} />
      </Section>
    </ErrorBoundary>
  )
}
