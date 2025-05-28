import clsx from 'clsx'
import { type NodePoolInfoDto } from 'qovery-ws-typescript-axios'
import { useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { Badge, Button, ProgressBar, StatusChip, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { calculatePercentage, formatNumber, mibToGib, milliCoreToVCPU, twMerge } from '@qovery/shared/util-js'
import { useClusterMetrics } from '../hooks/use-cluster-metrics/use-cluster-metrics'

const { Table } = TablePrimitives

interface MetricProgressBarProps {
  type: 'cpu' | 'memory' | 'disk'
  used: number
  reserved: number
  total: number
  unit: string
}

function MetricProgressBar({ type, used, reserved, total, unit }: MetricProgressBarProps) {
  const usedPercentage = calculatePercentage(used, total)
  const reservedPercentage = calculatePercentage(reserved, total)
  const totalPercentage = Math.round(usedPercentage + reservedPercentage)

  return (
    <div className="flex items-center gap-2 text-ssm">
      <span className="min-w-8 text-neutral-400">{totalPercentage}%</span>
      <Tooltip
        content={
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between border-b border-neutral-400">
              <div className="flex w-full items-center justify-between px-2.5 py-1.5">
                <span>{type === 'cpu' ? 'CPU' : type === 'memory' ? 'Memory' : 'Disk'} usage</span>
                <span className="ml-auto block font-semibold">{totalPercentage}%</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 px-2.5 py-1.5">
              <div className="flex w-full items-center gap-1.5">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-200" />
                  Reserved
                </span>
                <span className="ml-auto block font-semibold">
                  {reserved} {unit}
                </span>
              </div>
              <div className="flex w-full items-center gap-1.5">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-400" />
                  Used
                </span>
                <span className="ml-auto block font-semibold">
                  {used} {unit}
                </span>
              </div>
            </div>
          </div>
        }
        classNameContent="w-[173px] p-0"
      >
        <ProgressBar.Root mode="absolute">
          <ProgressBar.Cell percentage={reservedPercentage} color="var(--color-purple-200)" />
          <ProgressBar.Cell percentage={usedPercentage} color="var(--color-brand-400)" />
        </ProgressBar.Root>
      </Tooltip>
    </div>
  )
}

export interface ClusterTableNodeProps {
  organizationId: string
  clusterId: string
  nodePool?: NodePoolInfoDto
}

const KEY_KARPENTER_NODE_POOL = 'karpenter.sh/nodepool'
const KEY_KARPENTER_CAPACITY_TYPE = 'karpenter.sh/capacity-type'

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
    <Table.Root className="overflow-hidden border-t border-neutral-200">
      <Table.Header>
        <Table.Row className="divide-x divide-neutral-200 bg-neutral-100 text-ssm font-medium text-neutral-350">
          <Table.Cell className="h-8 w-1/4 px-3">Nodes</Table.Cell>
          <Table.Cell className="h-8 w-1/4 px-3">CPU</Table.Cell>
          <Table.Cell className="h-8 w-1/4 px-3">Memory</Table.Cell>
          <Table.Cell className="h-8 w-[calc(25%/3)] px-3">Instance</Table.Cell>
          <Table.Cell className="h-8 w-[calc(25%/3)] px-3">Disk</Table.Cell>
          <Table.Cell className="h-8 w-[calc(25%/3)] px-3">Age</Table.Cell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {nodes
          ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((node) => {
            const isWarning = Boolean(nodeWarnings[node.name])

            return (
              <Table.Row
                key={node.name}
                className={twMerge(
                  clsx(
                    'w-full divide-x divide-neutral-200 text-ssm transition-colors hover:bg-neutral-100',
                    isWarning && 'bg-yellow-50 hover:bg-yellow-50'
                  )
                )}
              >
                <Table.Cell className="h-12 w-1/4 px-5">
                  <div className="flex items-center gap-2 font-medium">
                    <StatusChip status={isWarning ? 'WARNING' : 'RUNNING'} className="inline-flex" />
                    <span className="truncate">{node.name}</span>
                  </div>
                </Table.Cell>
                <Table.Cell className="h-12 w-1/4 px-3">
                  <MetricProgressBar
                    type="cpu"
                    used={formatNumber(milliCoreToVCPU(node.metrics_usage?.cpu_milli_usage || 0))}
                    reserved={formatNumber(milliCoreToVCPU(node.resources_allocated.request_cpu_milli))}
                    total={formatNumber(milliCoreToVCPU(node.resources_allocatable.cpu_milli))}
                    unit="vCPU"
                  />
                </Table.Cell>
                <Table.Cell className="h-12 w-1/4 px-3">
                  <MetricProgressBar
                    type="memory"
                    used={formatNumber(
                      mibToGib(
                        Math.max(
                          node.metrics_usage?.memory_mib_rss_usage || 0,
                          node.metrics_usage?.memory_mib_working_set_usage || 0
                        )
                      )
                    )}
                    reserved={formatNumber(mibToGib(node.resources_allocated.request_memory_mib))}
                    total={formatNumber(mibToGib(node.resources_allocatable.memory_mib))}
                    unit="GB"
                  />
                </Table.Cell>
                <Table.Cell className="h-12 w-[calc(30%/3)] px-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="surface" radius="full">
                      {node.instance_type}
                    </Badge>
                    {node.labels[KEY_KARPENTER_CAPACITY_TYPE] === 'spot' && (
                      <Tooltip content="Spot instance">
                        <Badge variant="surface" radius="full" className="w-6 justify-center p-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            fill="none"
                            viewBox="0 0 12 12"
                          >
                            <g fill="#383E50" fillRule="evenodd" clipPath="url(#clip0_29751_96020)" clipRule="evenodd">
                              <path d="M1.5 11.625c0-.31.252-.562.563-.562h7.874a.562.562 0 1 1 0 1.124H2.064a.56.56 0 0 1-.563-.562M1.5.375c0-.31.252-.562.563-.562h7.874a.562.562 0 1 1 0 1.125H2.064A.563.563 0 0 1 1.5.375"></path>
                              <path d="M5.602 5.602c.22-.22.576-.22.796 0L8.88 8.085c.316.316.494.746.494 1.193v2.347a.562.562 0 1 1-1.125 0V9.278c0-.149-.06-.292-.165-.397L6 6.795 3.915 8.881a.56.56 0 0 0-.165.397v2.347a.562.562 0 1 1-1.125 0V9.278c0-.447.178-.876.494-1.193z"></path>
                              <path d="M3.188-.187c.31 0 .562.251.562.562v2.347c0 .149.06.292.165.397L6 5.205l2.085-2.086a.56.56 0 0 0 .165-.397V.375a.563.563 0 0 1 1.125 0v2.347c0 .447-.178.876-.494 1.193L6.398 6.398a.563.563 0 0 1-.796 0L3.12 3.915a1.7 1.7 0 0 1-.494-1.193V.375c0-.31.252-.562.563-.562"></path>
                            </g>
                            <defs>
                              <clipPath id="clip0_29751_96020">
                                <path fill="#fff" d="M0 0h12v12H0z"></path>
                              </clipPath>
                            </defs>
                          </svg>
                        </Badge>
                      </Tooltip>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell className="h-12 w-[calc(25%/3)] px-3">
                  {formatNumber(
                    calculatePercentage(
                      node.metrics_usage?.disk_mib_usage || 0,
                      node.resources_capacity.ephemeral_storage_mib
                    )
                  )}
                  %
                </Table.Cell>
                <Table.Cell className="h-12 w-[calc(20%/3)] px-3">
                  {timeAgo(new Date(node.created_at), true)}
                </Table.Cell>
              </Table.Row>
            )
          })}
      </Table.Body>
    </Table.Root>
  )
}

export default ClusterTableNode
