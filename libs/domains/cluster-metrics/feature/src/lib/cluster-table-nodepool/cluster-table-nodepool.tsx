import * as Accordion from '@radix-ui/react-accordion'
import clsx from 'clsx'
import { type ClusterNodeDto } from 'qovery-ws-typescript-axios'
import { useMemo } from 'react'
import { match } from 'ts-pattern'
import { useCluster, useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { Icon, Link, ProgressBar, Tooltip } from '@qovery/shared/ui'
import { calculatePercentage, pluralize, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { ClusterTableNode } from '../cluster-table-node/cluster-table-node'
import { useClusterMetrics } from '../hooks/use-cluster-metrics/use-cluster-metrics'
import { calculateNodePoolMetrics, calculateUntrackedNodesMetrics } from './calculate-nodepool-metrics'

export interface ClusterTableNodepoolProps {
  organizationId: string
  clusterId: string
}

interface SystemNodepoolProps {
  organizationId: string
  clusterId: string
  untrackedNodes: ClusterNodeDto[]
  nodeWarnings: Record<string, unknown>
}

function SystemNodepool({ organizationId, clusterId, untrackedNodes, nodeWarnings }: SystemNodepoolProps) {
  const untrackedMetrics = useMemo(
    () => calculateUntrackedNodesMetrics(untrackedNodes, nodeWarnings),
    [untrackedNodes, nodeWarnings]
  )

  const nodesHealthyPercentage = useMemo(
    () =>
      calculatePercentage(
        untrackedMetrics.nodesCount - untrackedMetrics.nodesWarningCount,
        untrackedMetrics.nodesCount
      ),
    [untrackedMetrics.nodesCount, untrackedMetrics.nodesWarningCount]
  )

  const nodesWarningPercentage = useMemo(
    () => calculatePercentage(untrackedMetrics.nodesWarningCount, untrackedMetrics.nodesCount),
    [untrackedMetrics.nodesWarningCount, untrackedMetrics.nodesCount]
  )

  const deployingPercentage = useMemo(
    () => calculatePercentage(untrackedMetrics.nodesDeployingCount, untrackedMetrics.nodesCount),
    [untrackedMetrics.nodesDeployingCount, untrackedMetrics.nodesCount]
  )

  return (
    <>
      <div className="mt-2 flex flex-col gap-1">
        <div className="text-sm font-medium text-neutral">System & infrastructure nodes (1)</div>
        <div className="text-xs text-neutral-subtle">
          These nodes run essential cluster services such as networking, autoscaling, and monitoring.
        </div>
      </div>
      <Accordion.Item
        key="untracked-nodes"
        value="untracked-nodes"
        className="rounded border border-neutral bg-surface-neutral [box-shadow:0px_1px_2px_0px_rgba(27,36,44,0.12)]"
      >
        <Accordion.Trigger className="group flex min-h-[86px] w-full items-start justify-between py-5">
          <div className="flex h-full w-1/4 items-start justify-between border-r border-neutral px-6">
            <div className="flex items-start gap-[18px]">
              <Tooltip content={untrackedMetrics.nodesWarningCount > 0 ? 'Warning' : 'Ready'}>
                <span className="flex h-5 w-4 items-center justify-center">
                  {untrackedMetrics.nodesWarningCount > 0 ? (
                    <Icon iconName="circle-exclamation" iconStyle="regular" className="text-base text-warning" />
                  ) : (
                    <Icon iconName="circle-check" iconStyle="regular" className="text-base text-positive" />
                  )}
                </span>
              </Tooltip>
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="text-left text-sm font-medium leading-[20px] text-neutral">Karpenter node group</div>
                <div className="text-left text-xs leading-[18px] text-neutral-subtle">
                  EKS managed node group that hosts the Karpenter controller and other essential cluster infrastructure
                  components.
                </div>
              </div>
            </div>
            <Icon
              iconName="chevron-down"
              iconStyle="solid"
              className="relative top-0.5 text-neutral-subtle transition-transform duration-200 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
            />
          </div>
          <div className="flex w-1/4 flex-col justify-start gap-3 border-r border-neutral px-5 pt-0.5">
            <div className="flex w-full items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-neutral-subtle">
                <Icon iconName="microchip" iconStyle="regular" className="relative top-[1px] text-neutral-subtle" />
                <span>
                  <Tooltip content="Capacity">
                    <span className="font-medium text-neutral">{untrackedMetrics.cpuReserved} vCPU</span>
                  </Tooltip>
                </span>
              </span>
            </div>
          </div>
          <div className="flex w-1/4 flex-col justify-start gap-3 border-r border-neutral px-5 pt-0.5">
            <div className="flex w-full items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-neutral-subtle">
                <Icon iconName="memory" iconStyle="regular" className="relative top-[1px] text-neutral-subtle" />
                <span>
                  <Tooltip content="Capacity">
                    <span className="font-medium text-neutral">{untrackedMetrics.memoryReserved} GB</span>
                  </Tooltip>
                </span>
              </span>
            </div>
          </div>
          <div className="flex w-1/4 flex-col justify-start gap-3 px-5 pt-0.5">
            <span className="flex items-center gap-2 text-sm text-neutral-subtle">
              <svg
                className="text-neutral-subtle"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M13 4a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2zm7 0h-5v5h5z"
                  clipRule="evenodd"
                ></path>
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M2.586 6.586A2 2 0 0 1 4 6h5a2 2 0 0 1 2 2v5h5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 .586-1.414M4 15v5h5v-5zm5-2H4V8h5zm2 2v5h5v-5z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span>
                <span className="font-medium text-neutral">{untrackedMetrics.nodesCount}</span>{' '}
                {pluralize(untrackedMetrics.nodesCount, 'node', 'nodes')}
              </span>
            </span>
            <Tooltip
              content={
                <div className="flex flex-col gap-1">
                  {untrackedMetrics.nodesCount -
                    untrackedMetrics.nodesWarningCount -
                    untrackedMetrics.nodesDeployingCount >
                    0 && (
                    <div className="flex items-center">
                      <div className="flex w-full items-center gap-1.5">
                        <Icon iconName="check-circle" iconStyle="regular" className="text-positive" />
                        <span>
                          Healthy{' '}
                          {pluralize(untrackedMetrics.nodesCount - untrackedMetrics.nodesWarningCount, 'node', 'nodes')}
                        </span>
                        <span className="ml-auto block font-semibold">
                          {untrackedMetrics.nodesCount - untrackedMetrics.nodesWarningCount}
                        </span>
                      </div>
                    </div>
                  )}
                  {untrackedMetrics.nodesWarningCount > 0 && (
                    <div className="flex w-full items-center gap-1.5">
                      <Icon iconName="exclamation-circle" iconStyle="regular" className="text-warning" />
                      <span>Warning {pluralize(untrackedMetrics.nodesWarningCount, 'node', 'nodes')}</span>
                      <span className="ml-auto block font-semibold">{untrackedMetrics.nodesWarningCount}</span>
                    </div>
                  )}
                  {untrackedMetrics.nodesDeployingCount > 0 && (
                    <div className="flex w-full items-center gap-1.5">
                      <Icon iconName="exclamation-circle" iconStyle="regular" className="text-brand" />
                      <span>Deploying {pluralize(untrackedMetrics.nodesDeployingCount, 'node', 'nodes')}</span>
                      <span className="ml-auto block font-semibold">{untrackedMetrics.nodesWarningCount}</span>
                    </div>
                  )}
                </div>
              }
              classNameContent="w-[157px] px-2.5 py-1.5"
            >
              <ProgressBar.Root>
                {deployingPercentage > 0 && <ProgressBar.Cell value={deployingPercentage} color="var(--brand-9)" />}
                {nodesHealthyPercentage - nodesWarningPercentage > 0 && (
                  <ProgressBar.Cell value={nodesHealthyPercentage} color="var(--positive-9)" />
                )}
                {nodesWarningPercentage > 0 && (
                  <ProgressBar.Cell value={nodesWarningPercentage} color="var(--warning-9)" />
                )}
              </ProgressBar.Root>
            </Tooltip>
          </div>
        </Accordion.Trigger>
        <Accordion.Content className="overflow-hidden data-[state=open]:animate-slidein-down-sm-faded">
          <ClusterTableNode nodes={untrackedNodes} organizationId={organizationId} clusterId={clusterId} />
        </Accordion.Content>
      </Accordion.Item>
    </>
  )
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
          <div className="flex items-center justify-between border-b border-neutral">
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
                    isCapacityReached
                      ? 'bg-surface-negative-solid'
                      : isLimitReached
                        ? 'bg-surface-warning-solid'
                        : 'bg-surface-brand-solid'
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
                <span className="h-2 w-2 rounded-full bg-surface-neutral-subtle" />
                Limit
              </span>
              <span className="ml-auto block">
                {limit} {unit}
              </span>
            </div>
          </div>
          {isLimitReached && !isCapacityReached && (
            <div className="border-neutral-subtle border-t px-2.5 py-1.5 text-warning">
              Resource limit nearly reached; further node deployments will not be possible
            </div>
          )}
          {isCapacityReached && (
            <div className="border-neutral-subtle border-t px-2.5 py-1.5 text-warning">
              Resource reserved exceed the limit; further node deployments will not be possible
            </div>
          )}
        </div>
      }
      classNameContent="w-[173px] p-0"
    >
      <ProgressBar.Root>
        {isCapacityReached ? (
          <ProgressBar.Cell value={100} color="var(--negative-9)" />
        ) : (
          <ProgressBar.Cell value={capacityPercentage} color={isLimitReached ? 'var(--warning-9)' : 'var(--brand-9)'} />
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

  // Find nodes that don't belong to any Karpenter nodepool (untracked nodes)
  const untrackedNodes = useMemo(() => {
    const trackedNodeNames = new Set(
      nodePools?.flatMap((nodePool) =>
        nodes.filter((node) => node.labels['karpenter.sh/nodepool'] === nodePool.name).map((node) => node.name)
      )
    )
    return nodes.filter((node) => !trackedNodeNames.has(node.name))
  }, [nodePools, nodes])

  if (nodes?.length === 0) return null

  return (
    <Accordion.Root type="multiple" className="flex flex-col gap-4">
      {nodePools && nodePools.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium text-neutral">Application node pools ({nodePools.length})</div>
          <div className="text-xs text-neutral-subtle">
            These node pools host your application workloads. Each pool can be customized to fit your scaling,
            performance, and cost requirements.
          </div>
        </div>
      )}
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
            className="rounded border border-neutral bg-surface-neutral [box-shadow:0px_1px_2px_0px_rgba(27,36,44,0.12)]"
          >
            <Accordion.Trigger className="group flex min-h-[86px] w-full items-start justify-between py-5">
              <div className="flex h-full w-1/4 items-start justify-between border-r border-neutral px-6">
                <div className="flex items-start gap-[18px]">
                  <Tooltip content={metrics.nodesWarningCount > 0 ? 'Warning' : 'Ready'}>
                    <span className="flex h-5 w-4 items-center justify-center">
                      {metrics.nodesWarningCount > 0 ? (
                        <Icon iconName="circle-exclamation" iconStyle="regular" className="text-base text-warning" />
                      ) : (
                        <Icon iconName="circle-check" iconStyle="regular" className="text-base text-positive" />
                      )}
                    </span>
                  </Tooltip>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <div className="text-left text-sm font-medium leading-[20px] text-neutral">
                      {upperCaseFirstLetter(nodePool.name)} nodepool
                    </div>
                    <div className="text-left text-xs leading-[18px] text-neutral-subtle">
                      {nodePool.name === 'default'
                        ? 'A versatile node pool used for general application deployments. Suitable for most workloads.'
                        : nodePool.name === 'stable'
                          ? 'Optimized for stable and long-running workloads requiring increased reliability and/or without auto scaling.'
                          : nodePool.name === 'gpu'
                            ? 'Used for GPU workloads, such as machine learning and data processing.'
                            : `Node pool for ${nodePool.name} workloads`}
                    </div>
                  </div>
                </div>
                <Icon
                  iconName="chevron-down"
                  iconStyle="solid"
                  className="relative top-0.5 text-neutral-subtle transition-transform duration-200 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
                />
              </div>
              <div className="flex w-1/4 flex-col justify-start gap-3 border-r border-neutral px-5 pt-0.5">
                <div className="flex w-full items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-neutral-subtle">
                    <Icon iconName="microchip" iconStyle="regular" className="relative top-[1px] text-neutral-subtle" />
                    <span>
                      <Tooltip content="Capacity">
                        <span className="font-medium text-neutral">{metrics.cpuUsed} vCPU</span>
                      </Tooltip>
                      {metrics.cpuTotal ? (
                        <span> (limit: {metrics.cpuTotal})</span>
                      ) : (
                        <span>
                          {' '}
                          (limit: <span>∞</span>)
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
                          to="/organization/$organizationId/cluster/$clusterId/settings/resources"
                          params={{ organizationId, clusterId }}
                        >
                          <Icon iconName="gear" iconStyle="regular" className="text-neutral-subtle" />
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
              <div className="flex w-1/4 flex-col justify-start gap-3 border-r border-neutral px-5 pt-0.5">
                <div className="flex w-full items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-neutral-subtle">
                    <Icon iconName="memory" iconStyle="regular" className="relative top-[1px] text-neutral-subtle" />
                    <span>
                      <Tooltip content="Capacity">
                        <span className="font-medium text-neutral">{metrics.memoryUsed} GB</span>
                      </Tooltip>
                      {metrics.memoryTotal ? (
                        ` (limit: ${metrics.memoryTotal})`
                      ) : (
                        <span>
                          {' '}
                          (limit: <span>∞</span>)
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
                          to="/organization/$organizationId/cluster/$clusterId/settings/resources"
                          params={{ organizationId, clusterId }}
                        >
                          <Icon iconName="gear" iconStyle="regular" className="text-neutral-subtle" />
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
              <div className="flex w-1/4 flex-col justify-start gap-3 px-5 pt-0.5">
                <span className="flex items-center gap-2 text-sm text-neutral-subtle">
                  <svg
                    className="text-neutral-subtle"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M13 4a2 0 0 1 2-2h5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2zm7 0h-5v5h5z"
                      clipRule="evenodd"
                    ></path>
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M2.586 6.586A2 2 0 0 1 4 6h5a2 2 0 0 1 2 2v5h5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 .586-1.414M4 15v5h5v-5zm5-2H4V8h5zm2 2v5h5v-5z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span>
                    <span className="font-medium text-neutral">{metrics.nodesCount}</span>{' '}
                    {pluralize(metrics.nodesCount, 'node', 'nodes')}
                  </span>
                </span>
                <Tooltip
                  content={
                    <div className="flex flex-col gap-1">
                      {metrics.nodesCount - metrics.nodesWarningCount - metrics.nodesDeployingCount > 0 && (
                        <div className="flex items-center">
                          <div className="flex w-full items-center gap-1.5">
                            <Icon iconName="check-circle" iconStyle="regular" className="text-positive" />
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
                          <Icon iconName="exclamation-circle" iconStyle="regular" className="text-warning" />
                          <span>Warning {pluralize(metrics.nodesWarningCount, 'node', 'nodes')}</span>
                          <span className="ml-auto block font-semibold">{metrics.nodesWarningCount}</span>
                        </div>
                      )}
                      {metrics.nodesDeployingCount > 0 && (
                        <div className="flex w-full items-center gap-1.5">
                          <Icon iconName="exclamation-circle" iconStyle="regular" className="text-brand" />
                          <span>Deploying {pluralize(metrics.nodesDeployingCount, 'node', 'nodes')}</span>
                          <span className="ml-auto block font-semibold">{metrics.nodesWarningCount}</span>
                        </div>
                      )}
                    </div>
                  }
                  classNameContent="w-[157px] px-2.5 py-1.5"
                >
                  <ProgressBar.Root>
                    {deployingPercentage > 0 && <ProgressBar.Cell value={deployingPercentage} color="var(--brand-9)" />}
                    {nodesHealthyPercentage - nodesWarningPercentage > 0 && (
                      <ProgressBar.Cell value={nodesHealthyPercentage} color="var(--positive-9)" />
                    )}
                    {nodesWarningPercentage > 0 && (
                      <ProgressBar.Cell value={nodesWarningPercentage} color="var(--warning-9)" />
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
      {untrackedNodes.length > 0 && (
        <SystemNodepool
          organizationId={organizationId}
          clusterId={clusterId}
          untrackedNodes={untrackedNodes}
          nodeWarnings={nodeWarnings}
        />
      )}
    </Accordion.Root>
  )
}

export default ClusterTableNodepool
