import { useParams } from 'react-router-dom'
import {
  ClusterCardNodeUsage,
  ClusterCardResources,
  ClusterCardSetup,
  ClusterTableNode,
  ClusterTableNodepool,
  useClusterMetrics,
} from '@qovery/domains/cluster-metrics/feature'
import { useCluster, useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { Icon, Tooltip } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { TableSkeleton } from './table-skeleton'

function TableLegend() {
  return (
    <div className="flex w-full items-center justify-end gap-1.5 text-xs text-neutral-400">
      <span className="block h-2 w-2 bg-brand-400"></span>
      <span className="flex items-center gap-1">
        Reserved
        <Tooltip content="Reserved CPU or memory represents the amount of resource guaranteed for this workload.">
          <span className="relative top-[1px] text-neutral-350">
            <Icon iconName="circle-question" iconStyle="regular" />
          </span>
        </Tooltip>
      </span>
    </div>
  )
}

export function PageOverviewFeature() {
  useDocumentTitle('Cluster - Overview')
  const { organizationId = '', clusterId = '' } = useParams()
  const { data: cluster, isLoading: isClusterLoading } = useCluster({ organizationId, clusterId })
  const { data: runningStatus } = useClusterRunningStatus({ organizationId, clusterId })
  const { data: clusterMetrics } = useClusterMetrics({ organizationId, clusterId })

  const isLoading = isClusterLoading || !runningStatus || !clusterMetrics

  const isKarpenter = cluster?.features?.find((feature) => feature.id === 'KARPENTER')

  if (typeof runningStatus === 'string') {
    return (
      <div className="h-80 p-8">
        <div className="flex h-full flex-col items-center justify-center gap-1 rounded border border-neutral-200 bg-neutral-100 py-10 text-sm text-neutral-350">
          <Icon className="text-xl text-neutral-300" iconName="circle-info" iconStyle="regular" />
          <span className="font-medium">No metrics available because the running status is unavailable.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="grid gap-6 md:grid-cols-3">
        <ClusterCardNodeUsage organizationId={organizationId} clusterId={clusterId} />
        <ClusterCardResources organizationId={organizationId} clusterId={clusterId} />
        <ClusterCardSetup organizationId={organizationId} clusterId={clusterId} />
      </div>
      {isLoading ? (
        <TableSkeleton />
      ) : isKarpenter ? (
        <div className="flex flex-col gap-4">
          <TableLegend />
          <ClusterTableNodepool organizationId={organizationId} clusterId={clusterId} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <TableLegend />
          <div className="overflow-hidden rounded border border-neutral-250">
            <ClusterTableNode organizationId={organizationId} clusterId={clusterId} className="border-0" />
          </div>
        </div>
      )}
    </div>
  )
}

export default PageOverviewFeature
