import { match } from 'ts-pattern'
import { useCluster, useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { CLUSTER_SETTINGS_RESOURCES_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { Icon, Link, ProgressBar, Tooltip } from '@qovery/shared/ui'

export interface CardNodeUsageProps {
  organizationId: string
  clusterId: string
}

export function CardNodeUsage({ organizationId, clusterId }: CardNodeUsageProps) {
  const { data: runningStatus } = useClusterRunningStatus({
    organizationId: organizationId,
    clusterId: clusterId,
  })
  const { data: cluster } = useCluster({ organizationId, clusterId })

  const totalNodes = runningStatus?.nodes?.length || 0
  const healthyNodes =
    runningStatus?.nodes?.filter(
      (node) => node.conditions?.find((condition) => condition.type === 'Ready')?.status === 'True'
    ).length || 0

  const warningNodes =
    runningStatus?.nodes?.filter(
      (node) => node.conditions?.find((condition) => condition.type === 'Ready')?.status === 'False'
    ).length || 0
  const unschedulableNodes = runningStatus?.nodes?.filter((node) => node.unschedulable).length || 0

  const healthyPercentage = totalNodes > 0 ? (healthyNodes / totalNodes) * 100 : 0
  const warningPercentage = totalNodes > 0 ? (warningNodes / totalNodes) * 100 : 0
  const unschedulablePercentage = totalNodes > 0 ? (unschedulableNodes / totalNodes) * 100 : 0

  const minNodes =
    runningStatus?.node_pools?.reduce((acc, nodePool) => {
      // Assuming there's a minimum nodes setting in each node pool config that we can access
      // If not available, fallback to current count for stable deployments
      return acc + (nodePool?.nodes_count || 0)
    }, 0) || 0

  const maxNodes =
    runningStatus?.node_pools?.reduce((acc, nodePool) => {
      // If there's a cpu_milli_limit or memory_mib_limit, use that to calculate theoretical max
      // Otherwise just use current count for the display
      if (nodePool?.cpu_milli_limit || nodePool?.memory_mib_limit) {
        // This is a simplification - you'd need proper logic to calculate max nodes
        // based on the actual resource limits and node capacities
        const cpuLimitFactor = nodePool.cpu_milli_limit ? nodePool.cpu_milli_limit / nodePool.cpu_milli : 0
        const memoryLimitFactor = nodePool.memory_mib_limit ? nodePool.memory_mib_limit / nodePool.memory_mib : 0

        // Use the more constraining factor (CPU or memory)
        const limitFactor = Math.max(cpuLimitFactor, memoryLimitFactor, 1)
        return acc + Math.ceil(nodePool.nodes_count * limitFactor)
      }
      // If no limits are set, assume autoscaling could double the current nodes (arbitrary)
      // Adjust this logic based on your actual autoscaling configuration
      return acc + nodePool.nodes_count * 2
    }, 0) || 0

  const tooltipContent = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center">
        <div className="flex w-full items-center gap-1.5">
          <Icon iconName="check-circle" iconStyle="regular" className="text-green-400" />
          <span>Healthy nodes</span>
          <span className="ml-auto block font-semibold">{healthyNodes}</span>
        </div>
      </div>
      {warningNodes > 0 && (
        <div className="flex w-full items-center gap-1.5">
          <Icon iconName="info-circle" iconStyle="regular" className="text-yellow-500" />
          <span>Warning nodes</span>
          <span className="ml-auto block font-semibold">{warningNodes}</span>
        </div>
      )}
    </div>
  )

  const shouldDisplayProgressBar = match(cluster)
    .with({ cloud_provider: 'GCP' }, () => false)
    .with({ cloud_provider: 'AWS', instance_type: 'KARPENTER' }, () => false)
    .otherwise(() => true)

  return (
    <div className="flex flex-col justify-between rounded border border-neutral-250 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-350">Nodes usages</p>
          <span className="text-[28px] font-bold text-neutral-400">{totalNodes}</span>
        </div>
        <Link
          color="current"
          to={CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_RESOURCES_URL}
        >
          <Icon iconName="gear" iconStyle="regular" className="text-base text-neutral-300" />
        </Link>
      </div>
      <div className="flex flex-col gap-2.5">
        {shouldDisplayProgressBar && (
          <div className="flex items-center justify-between text-sm text-neutral-350">
            <span>min: {minNodes}</span>
            <span>max: {maxNodes > minNodes ? maxNodes : 'auto'}</span>
          </div>
        )}
        <Tooltip
          content={tooltipContent}
          classNameContent="w-[157px]"
          delayDuration={300}
          disabled={!shouldDisplayProgressBar}
        >
          <ProgressBar.Root>
            {match(cluster)
              .with({ cloud_provider: 'GCP' }, () => <ProgressBar.Cell percentage={100} color="#44C979" />)
              .with({ cloud_provider: 'AWS', instance_type: 'KARPENTER' }, () => (
                <ProgressBar.Cell percentage={100} color="#44C979" />
              ))
              .otherwise(() => (
                <>
                  {healthyPercentage > 0 && <ProgressBar.Cell percentage={healthyPercentage} color="#44C979" />}
                  {warningPercentage > 0 && <ProgressBar.Cell percentage={warningPercentage} color="#F4C004" />}
                  {unschedulablePercentage > 0 && (
                    <ProgressBar.Cell percentage={unschedulablePercentage} color="#EDF1F7" />
                  )}
                </>
              ))}
          </ProgressBar.Root>
        </Tooltip>
      </div>
    </div>
  )
}

export default CardNodeUsage
