import { useParams } from '@tanstack/react-router'
import { useMemo } from 'react'
import { EmptyState, Heading, Icon, Link, Section } from '@qovery/shared/ui'
import { ClusterProductionHealthSummaryCard } from '../cluster-production-health-summary-card/cluster-production-health-summary-card'
import useClusterStatuses from '../hooks/use-cluster-statuses/use-cluster-statuses'
import useClusters from '../hooks/use-clusters/use-clusters'

export function SectionProductionHealth() {
  const { organizationId = '' }: { organizationId: string } = useParams({ strict: false })
  const { data: clusters = [] } = useClusters({ organizationId, suspense: true })
  const { data: clusterStatuses = [] } = useClusterStatuses({
    organizationId,
    refetchInterval: 3000,
    suspense: true,
  })

  const clusterProduction = useMemo(() => clusters?.filter((cluster) => cluster.production), [clusters]) ?? []

  return (
    <Section className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Heading className="flex items-center gap-2">Production health</Heading>
        <Link
          to="/organization/$organizationId/clusters"
          params={{ organizationId }}
          color="neutral"
          size="ssm"
          data-action="org-overview__all-clusters"
          className="gap-0.5 text-neutral-subtle hover:text-neutral"
        >
          All clusters
          <Icon iconName="angle-right" iconStyle="regular" />
        </Link>
      </div>
      {clusterProduction.length === 0 ? (
        <EmptyState
          title="No production cluster created yet"
          description="Create your first production cluster and start tracking your production health"
          icon="cube"
        >
          <Link
            as="button"
            color="neutral"
            size="md"
            data-action="org-overview__create-cluster"
            to="/organization/$organizationId/cluster/new"
            params={{ organizationId }}
          >
            <Icon iconName="circle-plus" />
            Create cluster
          </Link>
        </EmptyState>
      ) : (
        <ClusterProductionHealthSummaryCard clusters={clusterProduction} clusterStatuses={clusterStatuses} />
      )}
    </Section>
  )
}

export default SectionProductionHealth
