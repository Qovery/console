import clsx from 'clsx'
import { type NodePoolInfoDto } from 'qovery-ws-typescript-axios'
import { useMemo } from 'react'
import { useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { Badge, Icon, ProgressBar, Tooltip } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { calculatePercentage, formatNumber, mibToGib, milliCoreToVCPU, twMerge } from '@qovery/shared/util-js'
import { useClusterMetrics } from '../hooks/use-cluster-metrics/use-cluster-metrics'

interface MetricProgressBarProps {
  type: 'cpu' | 'memory'
  reserved: number
  reservedRaw: number
  total: number
  totalRaw: number
  unit: string
  isPressure?: boolean
}

function MetricProgressBar({
  type,
  reserved,
  reservedRaw,
  total,
  totalRaw,
  unit,
  isPressure = false,
}: MetricProgressBarProps) {
  const reservedPercentage = calculatePercentage(reservedRaw, totalRaw)
  const totalPercentage = Math.round(reservedPercentage)

  return (
    <div className="flex w-full items-center gap-1 text-ssm">
      <span
        className={clsx('flex min-w-8 items-center gap-1 whitespace-nowrap', {
          'text-red-500': isPressure,
          'text-neutral-400': !isPressure,
        })}
      >
        {totalPercentage}%
        {isPressure && (
          <Tooltip content={`Node has ${type} pressure condition`}>
            <span className="mr-1.5">
              <Icon iconName="circle-exclamation" iconStyle="regular" />
            </span>
          </Tooltip>
        )}
      </span>
      <Tooltip
        content={
          <div className="flex flex-col gap-1 font-normal">
            <div className="flex items-center justify-between border-b border-neutral-400">
              <span className="px-2.5 py-1.5">{type === 'cpu' ? 'CPU' : 'Memory'}</span>
            </div>
            <div className="flex flex-col gap-1 px-2.5 py-1.5">
              <div className="flex w-full items-center gap-1.5">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-500" />
                  Reserved
                </span>
                <span className="ml-auto block">
                  {reserved} {unit}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-400 px-2.5 py-1.5">
              <span>Total Available</span>
              <span className="ml-auto block">
                {total} {unit}
              </span>
            </div>
          </div>
        }
        classNameContent="w-[173px] p-0"
      >
        <div className="relative w-full">
          <ProgressBar.Root>
            <ProgressBar.Cell value={reservedPercentage} color="var(--color-brand-400)" />
          </ProgressBar.Root>
        </div>
      </Tooltip>
    </div>
  )
}

export interface ClusterTableNodeProps {
  organizationId: string
  clusterId: string
  nodePool?: NodePoolInfoDto
  className?: string
}

const KEY_KARPENTER_NODE_POOL = 'karpenter.sh/nodepool'
const KEY_KARPENTER_CAPACITY_TYPE = 'karpenter.sh/capacity-type'

export function ClusterTableNode({ nodePool, organizationId, clusterId, className }: ClusterTableNodeProps) {
  const { data: runningStatus } = useClusterRunningStatus({
    organizationId: organizationId,
    clusterId: clusterId,
  })
  const { data: metrics } = useClusterMetrics({
    organizationId: organizationId,
    clusterId: clusterId,
  })

  const nodes = useMemo(
    () =>
      (nodePool
        ? metrics?.nodes.filter((node) => node.labels[KEY_KARPENTER_NODE_POOL] === nodePool.name)
        : metrics?.nodes
      )?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [nodePool, metrics?.nodes]
  )
  const nodeWarnings = useMemo(
    () => runningStatus?.computed_status?.node_warnings || {},
    [runningStatus?.computed_status?.node_warnings]
  )

  if (!runningStatus) return null

  // Using div with flex instead of Table.Root for better alignment with cluster-table-nodepool
  // Ensures consistent column widths and spacing between both tables
  return (
    <div
      className={twMerge('divide-y divide-neutral-200 overflow-hidden border-t border-neutral-200 text-ssm', className)}
    >
      <div className="flex divide-x divide-neutral-200 bg-neutral-100 font-medium text-neutral-350">
        <div className="flex h-8 w-1/4 items-center px-3">Nodes</div>
        <div className="flex h-8 w-1/4 items-center px-3">CPU</div>
        <div className="flex h-8 w-1/4 items-center px-3">Memory</div>
        <div className="flex h-8 w-[calc(35%/3)] items-center px-3">Instance</div>
        <div className="flex h-8 w-[calc(20%/3)] items-center px-3">Disk</div>
        <div className="flex h-8 w-[calc(20%/3)] items-center px-3">Age</div>
      </div>

      {nodes?.map((node) => {
        const nodeWarning = nodeWarnings[node.name]

        const isReady = node.conditions?.some((condition) => condition.type === 'Ready' && condition.status === 'True')
        const isDiskPressure = node.conditions?.some(
          (condition) => condition.type === 'DiskPressure' && condition.status === 'True'
        )
        const isMemoryPressure = node.conditions?.some(
          (condition) => condition.type === 'MemoryPressure' && condition.status === 'True'
        )
        const isPIDPressure = node.conditions?.some(
          (condition) => condition.type === 'PIDPressure' && condition.status === 'True'
        )

        const isWarning = isDiskPressure || isMemoryPressure || !isReady || isPIDPressure || nodeWarning

        const status = () => {
          if (!isWarning) {
            return 'Ready'
          }
          if (!isReady) {
            return 'NotReady'
          }
          if (isDiskPressure) {
            return 'DiskPressure - Update the size or your instance type'
          }
          if (isMemoryPressure) {
            return 'MemoryPressure'
          }
          if (isPIDPressure) {
            return 'PIDPressure'
          }
          if (nodeWarning) {
            return nodeWarning[0].message ?? 'Warning'
          }
          return 'Warning'
        }

        return (
          <div
            key={node.name}
            className={twMerge(
              clsx(
                'flex divide-x divide-neutral-200 transition-colors hover:bg-neutral-100',
                isWarning && 'bg-yellow-50 hover:bg-yellow-50'
              )
            )}
          >
            <div className="flex h-12 w-1/4 min-w-0 items-center gap-2.5 px-5 font-medium text-neutral-400">
              <Tooltip content={status()}>
                <span className="flex items-center gap-1">
                  {isWarning ? (
                    <Icon iconName="circle-exclamation" iconStyle="regular" className="text-base text-yellow-500" />
                  ) : (
                    <Icon iconName="circle-check" iconStyle="regular" className="text-base text-green-500" />
                  )}
                </span>
              </Tooltip>
              <Tooltip content={node.name}>
                <span className="truncate">{node.name}</span>
              </Tooltip>
            </div>
            <div className="flex h-12 w-1/4 items-center px-3">
              <MetricProgressBar
                type="cpu"
                reserved={formatNumber(milliCoreToVCPU(node.resources_allocated.request_cpu_milli))}
                reservedRaw={milliCoreToVCPU(node.resources_allocated.request_cpu_milli)}
                total={formatNumber(milliCoreToVCPU(node.resources_allocatable.cpu_milli))}
                totalRaw={milliCoreToVCPU(node.resources_allocatable.cpu_milli)}
                unit="vCPU"
              />
            </div>
            <div className="flex h-12 w-1/4 items-center px-3">
              <MetricProgressBar
                type="memory"
                reserved={formatNumber(mibToGib(node.resources_allocated.request_memory_mib))}
                reservedRaw={mibToGib(node.resources_allocated.request_memory_mib)}
                total={formatNumber(mibToGib(node.resources_allocatable.memory_mib))}
                totalRaw={mibToGib(node.resources_allocatable.memory_mib)}
                unit="GB"
                isPressure={isMemoryPressure}
              />
            </div>
            <div className="flex h-12 w-[calc(35%/3)] items-center gap-2 overflow-hidden px-3">
              <Badge variant="surface" radius="full" className="lowercase">
                {node.instance_type?.replace('_', ' ')}
              </Badge>
              {node.labels[KEY_KARPENTER_CAPACITY_TYPE] === 'spot' && (
                <Tooltip content="Spot instance">
                  <Badge variant="surface" radius="full" className="w-6 justify-center p-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12">
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
            <div
              className={twMerge(
                clsx('flex h-12 w-[calc(20%/3)] items-center px-3 text-neutral-400', {
                  'text-red-500': isDiskPressure,
                })
              )}
            >
              {formatNumber(mibToGib(node.resources_capacity.ephemeral_storage_mib || 0))} GB
              {isDiskPressure && (
                <Tooltip content="Node has disk pressure condition. Update the size or your instance type.">
                  <span className="ml-1 inline-block text-red-500">
                    <Icon iconName="circle-exclamation" iconStyle="regular" />
                  </span>
                </Tooltip>
              )}
            </div>
            <div className="flex h-12 w-[calc(20%/3)] items-center px-3 text-neutral-400">
              {timeAgo(new Date(node.created_at), true)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ClusterTableNode
