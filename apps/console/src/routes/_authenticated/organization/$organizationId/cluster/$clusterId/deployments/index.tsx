import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import {
  ClusterActions,
  ClusterDeploymentList,
  ClusterDeploymentListSkeleton,
  useCluster,
  useClusterStatus,
} from '@qovery/domains/clusters/feature'
import { Heading, Section } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/deployments/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const { data: cluster } = useCluster({ organizationId, clusterId })
  const { data: clusterStatus } = useClusterStatus({ organizationId, clusterId })

  return (
    <div className="container mx-auto flex min-h-page-container flex-col pt-6">
      <Section className="min-h-0 flex-1 gap-8">
        <div className="flex shrink-0 flex-col gap-6">
          <div className="flex justify-between">
            <Heading>Deployments</Heading>
            {cluster && clusterStatus && (
              <ClusterActions cluster={cluster} clusterStatus={clusterStatus} variant="header" />
            )}
          </div>
          <hr className="w-full border-neutral" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-8 pb-20">
          <Suspense fallback={<ClusterDeploymentListSkeleton />}>
            <ClusterDeploymentList organizationId={organizationId} clusterId={clusterId} />
          </Suspense>
        </div>
      </Section>
    </div>
  )
}
