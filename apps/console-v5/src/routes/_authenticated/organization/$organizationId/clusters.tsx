import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ClusterCard } from '@qovery/domains/clusters/feature'
import { EmptyState, Heading, Icon, Link, LoaderSpinner, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { queries } from '@qovery/state/util-queries'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/clusters')({
  component: RouteComponent,
})

const Clusters = () => {
  const { organizationId = '' } = useParams({ strict: false })
  const { data: clusters = [] } = useQuery({ ...queries.clusters.list({ organizationId }), suspense: true })
  const { data: clusterStatuses = [] } = useQuery({
    ...queries.clusters.listStatuses({ organizationId }),
    suspense: true,
  })

  if (clusters.length === 0) {
    return (
      <EmptyState title="Create your first cluster">
        <Link to="/" as="button" className="mt-4 items-center gap-2" size="md">
          New Cluster
          <Icon iconName="circle-plus" iconStyle="regular" />
        </Link>
      </EmptyState>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
      {clusters.map((cluster) => (
        <ClusterCard
          key={cluster.id}
          cluster={cluster}
          clusterDeploymentStatus={clusterStatuses.find((c) => c.cluster_id === cluster.id)}
        />
      ))}
    </div>
  )
}

function RouteComponent() {
  useDocumentTitle('Clusters - Manage your clusters')
  const { organizationId = '' } = useParams({ strict: false })

  return (
    <div className="container mx-auto mt-6 pb-10">
      <Section className="gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between">
            <Heading>Clusters</Heading>
            <Link
              to="/organization/$organizationId/cluster/new"
              params={{ organizationId }}
              as="button"
              className="gap-2"
              size="md"
            >
              New Cluster
              <Icon iconName="circle-plus" iconStyle="regular" />
            </Link>
          </div>
          <hr className="w-full border-neutral" />
        </div>
        <div>
          <Suspense
            fallback={
              <div data-testid="clusters-loader" className="flex justify-center">
                <LoaderSpinner className="w-6" />
              </div>
            }
          >
            <Clusters />
          </Suspense>
        </div>
      </Section>
    </div>
  )
}
