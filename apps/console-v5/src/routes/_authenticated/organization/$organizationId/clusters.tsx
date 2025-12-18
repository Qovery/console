import { createFileRoute, useParams } from '@tanstack/react-router'
import { ClusterCard, useClusterStatuses, useClusters } from '@qovery/domains/clusters/feature'
import { EmptyState, Heading, Icon, Link, LoaderSpinner, Section } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/clusters')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '' } = useParams({ strict: false })
  const { data: clusters = [], isLoading: isLoadingCluster } = useClusters({ organizationId: organizationId })
  const { data: clusterStatuses = [], isLoading: isLoadingClusterStatus } = useClusterStatuses({
    organizationId: organizationId,
  })

  const isLoading = isLoadingCluster || isLoadingClusterStatus

  return (
    <div className="container mx-auto pb-10">
      <Section className="gap-8">
        <div className="flex flex-col gap-6">
          <Heading>Clusters</Heading>
          <hr className="w-full border-neutral" />
        </div>
        <div>
          {isLoading && clusters?.length === 0 ? (
            <div data-testid="clusters-loader" className="flex justify-center">
              <LoaderSpinner className="w-6" />
            </div>
          ) : clusters && clusters.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {clusters.map((cluster) => (
                <ClusterCard
                  key={cluster.id}
                  cluster={cluster}
                  clusterDeploymentStatus={clusterStatuses.find((c) => c.cluster_id === cluster.id)}
                />
              ))}
            </div>
          ) : (
            !isLoading &&
            clusters?.length === 0 && (
              <EmptyState title="Create your first cluster">
                <Link to="/" as="button" className="mt-4 items-center gap-2" size="md">
                  New Cluster
                  <Icon iconName="circle-plus" iconStyle="regular" />
                </Link>
              </EmptyState>
            )
          )}
        </div>
      </Section>
    </div>
  )
}
