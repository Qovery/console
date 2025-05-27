import { type NodePoolInfoDto } from 'qovery-ws-typescript-axios'
import { useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { StatusChip, TablePrimitives } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { useClusterMetrics } from '../hooks/use-cluster-metrics/use-cluster-metrics'

const { Table } = TablePrimitives

export interface ClusterTableNodeProps {
  organizationId: string
  clusterId: string
  nodePool?: NodePoolInfoDto
}

const KEY_KARPENTER_NODE_POOL = 'karpenter.sh/nodepool'

export function ClusterTableNode({ nodePool, organizationId, clusterId }: ClusterTableNodeProps) {
  const { data: runningStatus } = useClusterRunningStatus({
    organizationId: organizationId,
    clusterId: clusterId,
  })
  const { data: metrics } = useClusterMetrics({
    organizationId: organizationId,
    clusterId: clusterId,
  })

  const getNodeAssociatedToNodePool = (nodePool: NodePoolInfoDto) => {
    return metrics?.nodes.filter((node) => node.labels[KEY_KARPENTER_NODE_POOL] === nodePool.name)
  }

  const nodes = nodePool ? getNodeAssociatedToNodePool(nodePool) : metrics?.nodes
  const nodeWarnings = runningStatus?.computed_status?.node_warnings || {}

  return (
    <Table.Root className="border-t border-neutral-200">
      <Table.Header>
        <Table.Row className="bg-neutral-100 text-ssm font-medium text-neutral-350">
          <Table.Cell className="h-8 border-r border-neutral-200 px-3">Nodes</Table.Cell>
          <Table.Cell className="h-8 border-r border-neutral-200 px-3">CPU</Table.Cell>
          <Table.Cell className="h-8 border-r border-neutral-200 px-3">Memory</Table.Cell>
          <Table.Cell className="h-8 border-r border-neutral-200 px-3">Disk</Table.Cell>
          <Table.Cell className="h-8 px-3">Age</Table.Cell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {nodes?.map((node) => (
          <Table.Row key={node.name} className="text-ssm">
            <Table.Cell className="h-12 border-r border-neutral-200 px-5">
              <div className="flex items-center gap-2 font-medium">
                <StatusChip status={nodeWarnings[node.name] ? 'WARNING' : 'RUNNING'} className="inline-flex" />
                {node.name}
              </div>
            </Table.Cell>
            <Table.Cell className="h-12 border-r border-neutral-200 px-3">
              {node.metrics_usage?.cpu_milli_usage}
            </Table.Cell>
            <Table.Cell className="h-12 border-r border-neutral-200 px-3">
              {node.metrics_usage?.memory_mib_rss_usage}
            </Table.Cell>
            <Table.Cell className="h-12 border-r border-neutral-200 px-3">
              {node.metrics_usage?.disk_mib_usage}
            </Table.Cell>
            <Table.Cell className="h-12 border-r border-neutral-200 px-3">
              {timeAgo(new Date(node.created_at))}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

export default ClusterTableNode
