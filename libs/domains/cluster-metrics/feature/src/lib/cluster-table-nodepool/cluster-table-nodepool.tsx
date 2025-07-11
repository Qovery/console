import * as Accordion from '@radix-ui/react-accordion'
import clsx from 'clsx'
import { match } from 'ts-pattern'
import { useCluster, useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { CLUSTER_SETTINGS_RESOURCES_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { Icon, Link, ProgressBar, Tooltip } from '@qovery/shared/ui'
import { calculatePercentage, pluralize, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { ClusterTableNode } from '../cluster-table-node/cluster-table-node'
import { useClusterMetrics } from '../hooks/use-cluster-metrics/use-cluster-metrics'
import { calculateNodePoolMetrics } from './calculate-nodepool-metrics'

export interface ClusterTableNodepoolProps {
  organizationId: string
  clusterId: string
}

interface MetricProgressBarProps {
  type: 'cpu' | 'memory'
  capacity: number
  capacityRaw: number
  limit: number | null
  limitRaw: number | null
  unit: string
}

function MetricProgressBar({ type, capacity, capacityRaw, limit, limitRaw, unit }: MetricProgressBarProps) {
  if (limit === null || limitRaw === null) return null

  const capacityPercentage = calculatePercentage(capacityRaw, limitRaw)
  const isLimitReached = capacityPercentage > 80
  const isCapacityReached = capacityRaw > limitRaw

  return (
    <Tooltip
      content={
        <div className="flex flex-col font-normal">
          <div className="flex items-center justify-between border-b border-neutral-400">
            <div className="flex w-full items-center justify-between px-2.5 py-1.5">
              {type === 'cpu' ? 'CPU' : 'Memory'} nodepool
            </div>
          </div>
          <div className="flex flex-col gap-1 px-2.5 py-1.5">
            <div className="flex w-full items-center gap-1.5">
              <span className="flex items-center gap-2">
                <span
                  className={clsx(
                    'h-2 w-2 rounded-full',
                    isCapacityReached ? 'bg-red-500' : isLimitReached ? 'bg-yellow-500' : 'bg-brand-400'
                  )}
                />
                Reserved
              </span>
              <span className="ml-auto block">
                {capacity} {unit}
              </span>
            </div>
            <div className="flex w-full items-center gap-1.5">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-neutral-150" />
                Limit
              </span>
              <span className="ml-auto block">
                {limit} {unit}
              </span>
            </div>
          </div>
          {isLimitReached && !isCapacityReached && (
            <div className="border-t border-neutral-400 px-2.5 py-1.5 text-yellow-300">
              Resource limit nearly reached; further node deployments will not be possible
            </div>
          )}
          {isCapacityReached && (
            <div className="border-t border-neutral-400 px-2.5 py-1.5 text-yellow-300">
              Resource reserved exceed the limit; further node deployments will not be possible
            </div>
          )}
        </div>
      }
      classNameContent="w-[173px] p-0"
    >
      <ProgressBar.Root>
        {isCapacityReached ? (
          <ProgressBar.Cell value={100} color="var(--color-red-500)" />
        ) : (
          <ProgressBar.Cell
            value={capacityPercentage}
            color={isLimitReached ? 'var(--color-yellow-500)' : 'var(--color-brand-400)'}
          />
        )}
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
            <Accordion.Trigger className="group flex h-[86px] w-full items-center justify-between py-5">
              <div className="flex h-full w-1/4 items-center justify-between border-r border-neutral-200 px-6">
                <div className="flex items-center gap-[18px]">
                  <Tooltip content={metrics.nodesWarningCount > 0 ? 'Warning' : 'Ready'}>
                    <span className="flex items-center gap-1">
                      {metrics.nodesWarningCount > 0 ? (
                        <Icon iconName="circle-exclamation" iconStyle="regular" className="text-base text-yellow-500" />
                      ) : (
                        <Icon iconName="circle-check" iconStyle="regular" className="text-base text-green-500" />
                      )}
                    </span>
                  </Tooltip>
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
              <div className="flex w-1/4 flex-col gap-3 border-r border-neutral-200 px-5">
                <div className="flex w-full items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-neutral-350">
                    <Icon iconName="microchip" iconStyle="regular" className="relative top-[1px] text-neutral-300" />
                    <span>
                      <Tooltip content="Capacity">
                        <span className="font-medium text-neutral-400">{metrics.cpuUsed} vCPU</span>
                      </Tooltip>
                      {metrics.cpuTotal ? (
                        <span> (limit: {metrics.cpuTotal})</span>
                      ) : (
                        <span>
                          {' '}
                          (limit: <span className="relative top-[1px]">∞</span>)
                        </span>
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
                          <Icon iconName="gear" iconStyle="regular" className="text-neutral-300" />
                        </Link>
                      </Tooltip>
                    ))}
                </div>
                <MetricProgressBar
                  type="cpu"
                  capacity={metrics.cpuReserved}
                  capacityRaw={metrics.cpuReservedRaw}
                  limit={metrics.cpuTotal}
                  limitRaw={metrics.cpuTotalRaw}
                  unit="vCPU"
                />
              </div>
              <div className="flex w-1/4 flex-col gap-3 border-r border-neutral-200 px-5">
                <div className="flex w-full items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-neutral-350">
                    <Icon iconName="memory" iconStyle="regular" className="relative top-[1px] text-neutral-300" />
                    <span>
                      <Tooltip content="Capacity">
                        <span className="font-medium text-neutral-400">{metrics.memoryUsed} GB</span>
                      </Tooltip>
                      {metrics.memoryTotal ? (
                        ` (limit: ${metrics.memoryTotal})`
                      ) : (
                        <span>
                          {' '}
                          (limit: <span className="relative top-[1px]">∞</span>)
                        </span>
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
                          <Icon iconName="gear" iconStyle="regular" className="text-neutral-300" />
                        </Link>
                      </Tooltip>
                    ))}
                </div>
                <MetricProgressBar
                  type="memory"
                  capacity={metrics.memoryReserved}
                  capacityRaw={metrics.memoryReservedRaw}
                  limit={metrics.memoryTotal}
                  limitRaw={metrics.memoryTotalRaw}
                  unit="GB"
                />
              </div>
              <div className="flex w-1/4 flex-col gap-3 px-5">
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
                      <ProgressBar.Cell value={deployingPercentage} color="var(--color-brand-500" />
                    )}
                    {nodesHealthyPercentage - nodesWarningPercentage > 0 && (
                      <ProgressBar.Cell value={nodesHealthyPercentage} color="var(--color-green-500)" />
                    )}
                    {nodesWarningPercentage > 0 && (
                      <ProgressBar.Cell value={nodesWarningPercentage} color="var(--color-yellow-500)" />
                    )}
                  </ProgressBar.Root>
                </Tooltip>
              </div>
            </Accordion.Trigger>
            <Accordion.Content className="overflow-hidden data-[state=open]:animate-slidein-down-sm-faded">
              <ClusterTableNode nodePool={nodePool} organizationId={organizationId} clusterId={clusterId} />
            </Accordion.Content>
          </Accordion.Item>
        )
      })}
    </Accordion.Root>
  )
}

export default ClusterTableNodepool
