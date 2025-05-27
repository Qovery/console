import * as Accordion from '@radix-ui/react-accordion'
import clsx from 'clsx'
import { match } from 'ts-pattern'
import { useCluster, useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { CLUSTER_SETTINGS_RESOURCES_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { Icon, Link, ProgressBar, StatusChip, Tooltip } from '@qovery/shared/ui'
import { calculatePercentage, pluralize, twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { ClusterTableNode } from '../cluster-table-node/cluster-table-node'
import useClusterMetrics from '../hooks/use-cluster-metrics/use-cluster-metrics'
import { calculateNodePoolMetrics } from './calculate-node-pool-metrics'

export interface ClusterTableNodepoolProps {
  organizationId: string
  clusterId: string
}

interface MetricProgressBarProps {
  type: 'cpu' | 'memory'
  used: number
  reserved: number
  total: number | null
  unit: string
}

function MetricProgressBar({ type, used, reserved, total, unit }: MetricProgressBarProps) {
  if (total == null) {
    return (
      <div className="flex items-center gap-1.5 text-center text-ssm text-neutral-350">
        No limit <Icon iconName="infinity" className="relative top-[1px] text-neutral-300" />
      </div>
    )
  }

  const usedPercentage = calculatePercentage(used, total)
  const reservedPercentage = calculatePercentage(reserved, total)
  const totalPercentage = Math.round(usedPercentage + reservedPercentage)

  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between border-b border-neutral-400">
            <div className="flex w-full items-center justify-between px-2.5 py-1.5">
              <span>{type === 'cpu' ? 'CPU' : 'Memory'} nodepool</span>
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
      <ProgressBar.Root>
        <ProgressBar.Cell percentage={usedPercentage} color="var(--color-brand-400)" />
        <ProgressBar.Cell percentage={reservedPercentage} color="var(--color-purple-200)" />
      </ProgressBar.Root>
    </Tooltip>
  )
}

export function ClusterTableNodepool({ organizationId, clusterId }: ClusterTableNodepoolProps) {
  const { data: runningStatus } = useClusterRunningStatus({
    organizationId: organizationId,
    clusterId: clusterId,
  })
  const { data: metrics } = useClusterMetrics({
    organizationId: organizationId,
    clusterId: clusterId,
  })
  const { data: cluster } = useCluster({ organizationId, clusterId })

  const nodePools = metrics?.node_pools
  const nodes = metrics?.nodes || []
  const nodeWarnings = runningStatus?.computed_status?.node_warnings || {}

  if (nodes?.length === 0) return null

  return (
    <Accordion.Root type="multiple" className="flex flex-col gap-4">
      {nodePools?.map((nodePool) => {
        const metrics = calculateNodePoolMetrics(nodePool, nodes, nodeWarnings)

        const nodesHealthyPercentage = calculatePercentage(
          metrics.nodesCount - metrics.nodesWarningCount,
          metrics.nodesCount
        )
        const nodesWarningPercentage = calculatePercentage(metrics.nodesWarningCount, metrics.nodesCount)
        const deployingPercentage = calculatePercentage(metrics.nodesDeployingCount, metrics.nodesCount)

        return (
          <Accordion.Item
            key={nodePool.name}
            value={nodePool.name}
            className="rounded border border-neutral-250 [box-shadow:0px_1px_2px_0px_rgba(27,36,44,0.12)]"
          >
            <Accordion.Trigger className="group grid h-[86px] w-full grid-cols-4 items-center justify-between p-5">
              <div className="flex h-full items-center justify-between border-r border-neutral-200 pr-6">
                <div className="flex items-center gap-[18px]">
                  <StatusChip status={metrics.nodesWarningCount > 0 ? 'WARNING' : 'RUNNING'} />
                  <div className="text-sm font-medium text-neutral-400">
                    {upperCaseFirstLetter(nodePool.name)} nodepool
                  </div>
                </div>
                <Icon
                  iconName="chevron-down"
                  iconStyle="solid"
                  className="text-neutral-350 transition-transform duration-200 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
                />
              </div>
              <div
                className={twMerge(
                  clsx('flex flex-col gap-3 border-r border-neutral-200 px-5', {
                    'gap-2': !metrics.cpuTotal,
                  })
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-neutral-350">
                    <Icon iconName="microchip" iconStyle="regular" className="relative top-[1px] text-neutral-300" />
                    <span>
                      {metrics.cpuTotal ? (
                        <>
                          <span className="font-medium text-neutral-400">{metrics.cpuUsed} </span>/{metrics.cpuReserved}{' '}
                          vCPU
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-neutral-400">{metrics.cpuUsed}</span> vCPU
                        </>
                      )}
                    </span>
                  </span>
                  {match(cluster?.cloud_provider)
                    .with('GCP', () => null)
                    .with('ON_PREMISE', () => null)
                    .otherwise(() => (
                      <Tooltip content="Edit limits">
                        <Link
                          color="current"
                          to={
                            CLUSTER_URL(organizationId, clusterId) +
                            CLUSTER_SETTINGS_URL +
                            CLUSTER_SETTINGS_RESOURCES_URL
                          }
                        >
                          <Icon iconName="pen" iconStyle="regular" className="text-neutral-300" />
                        </Link>
                      </Tooltip>
                    ))}
                </div>
                <MetricProgressBar
                  type="cpu"
                  used={metrics.cpuUsed}
                  reserved={metrics.cpuReserved}
                  total={metrics.cpuTotal}
                  unit="vCPU"
                />
              </div>
              <div
                className={twMerge(
                  clsx('flex flex-col gap-3 border-r border-neutral-200 px-5', {
                    'gap-2': !metrics.memoryTotal,
                  })
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-neutral-350">
                    <Icon iconName="memory" iconStyle="regular" className="relative top-[1px] text-neutral-300" />
                    <span>
                      {metrics.memoryTotal ? (
                        <>
                          <span className="font-medium text-neutral-400">{metrics.memoryUsed} </span>/
                          {metrics.memoryReserved} GB
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-neutral-400">{metrics.memoryUsed}</span> GB
                        </>
                      )}
                    </span>
                  </span>
                  {match(cluster?.cloud_provider)
                    .with('GCP', () => null)
                    .with('ON_PREMISE', () => null)
                    .otherwise(() => (
                      <Tooltip content="Edit limits">
                        <Link
                          color="current"
                          to={
                            CLUSTER_URL(organizationId, clusterId) +
                            CLUSTER_SETTINGS_URL +
                            CLUSTER_SETTINGS_RESOURCES_URL
                          }
                        >
                          <Icon iconName="pen" iconStyle="regular" className="text-neutral-300" />
                        </Link>
                      </Tooltip>
                    ))}
                </div>
                <MetricProgressBar
                  type="memory"
                  used={metrics.memoryUsed}
                  reserved={metrics.memoryReserved}
                  total={metrics.memoryTotal}
                  unit="GB"
                />
              </div>
              <div className="flex flex-col gap-3 pl-5">
                <span className="relative -top-1 flex items-center gap-2 text-sm text-neutral-350">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path
                      fill="var(--color-neutral-300)"
                      fillRule="evenodd"
                      d="M13 4a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2zm7 0h-5v5h5z"
                      clipRule="evenodd"
                    ></path>
                    <path
                      fill="var(--color-neutral-300)"
                      fillRule="evenodd"
                      d="M2.586 6.586A2 2 0 0 1 4 6h5a2 2 0 0 1 2 2v5h5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 .586-1.414M4 15v5h5v-5zm5-2H4V8h5zm2 2v5h5v-5z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span>
                    <span className="font-medium text-neutral-400">{metrics.nodesCount}</span>{' '}
                    {pluralize(metrics.nodesCount, 'node', 'nodes')}
                  </span>
                </span>
                <Tooltip
                  content={
                    <div className="flex flex-col gap-1">
                      {metrics.nodesCount - metrics.nodesWarningCount - metrics.nodesDeployingCount > 0 && (
                        <div className="flex items-center">
                          <div className="flex w-full items-center gap-1.5">
                            <Icon iconName="check-circle" iconStyle="regular" className="text-green-400" />
                            <span>
                              Healthy {pluralize(metrics.nodesCount - metrics.nodesWarningCount, 'node', 'nodes')}
                            </span>
                            <span className="ml-auto block font-semibold">
                              {metrics.nodesCount - metrics.nodesWarningCount}
                            </span>
                          </div>
                        </div>
                      )}
                      {metrics.nodesWarningCount > 0 && (
                        <div className="flex w-full items-center gap-1.5">
                          <Icon iconName="exclamation-circle" iconStyle="regular" className="text-yellow-500" />
                          <span>Warning {pluralize(metrics.nodesWarningCount, 'node', 'nodes')}</span>
                          <span className="ml-auto block font-semibold">{metrics.nodesWarningCount}</span>
                        </div>
                      )}
                      {metrics.nodesDeployingCount > 0 && (
                        <div className="flex w-full items-center gap-1.5">
                          <Icon iconName="exclamation-circle" iconStyle="regular" className="text-brand-300" />
                          <span>Deploying {pluralize(metrics.nodesDeployingCount, 'node', 'nodes')}</span>
                          <span className="ml-auto block font-semibold">{metrics.nodesWarningCount}</span>
                        </div>
                      )}
                    </div>
                  }
                  classNameContent="w-[157px] px-2.5 py-1.5"
                >
                  <ProgressBar.Root>
                    {deployingPercentage > 0 && (
                      <ProgressBar.Cell percentage={deployingPercentage} color="var(--color-brand-500" />
                    )}
                    {nodesHealthyPercentage - nodesWarningPercentage > 0 && (
                      <ProgressBar.Cell percentage={nodesHealthyPercentage} color="var(--color-green-500)" />
                    )}
                    {nodesWarningPercentage > 0 && (
                      <ProgressBar.Cell percentage={nodesWarningPercentage} color="var(--color-yellow-500)" />
                    )}
                  </ProgressBar.Root>
                </Tooltip>
              </div>
            </Accordion.Trigger>
            <Accordion.Content className="overflow-hidden data-[state=closed]:animate-slidein-up-sm-faded data-[state=open]:animate-slidein-down-sm-faded">
              <ClusterTableNode nodePool={nodePool} organizationId={organizationId} clusterId={clusterId} />
            </Accordion.Content>
          </Accordion.Item>
        )
      })}
    </Accordion.Root>
  )
}

export default ClusterTableNodepool
