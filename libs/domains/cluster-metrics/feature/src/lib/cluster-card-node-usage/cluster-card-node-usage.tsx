import { match } from 'ts-pattern'
import { useCluster, useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { CLUSTER_SETTINGS_RESOURCES_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { Icon, Link, ProgressBar, Skeleton, Tooltip } from '@qovery/shared/ui'
import { calculatePercentage, pluralize } from '@qovery/shared/util-js'

export interface ClusterCardNodeUsageProps {
  organizationId: string
  clusterId: string
}

export function ClusterCardNodeUsage({ organizationId, clusterId }: ClusterCardNodeUsageProps) {
  const { data: runningStatus } = useClusterRunningStatus({
    organizationId: organizationId,
    clusterId: clusterId,
  })

  const runningStatusNotAvailable = typeof runningStatus !== 'object'

  const { data: cluster } = useCluster({ organizationId, clusterId })

  const shouldDisplayMinMaxNodes = match(cluster)
    .with({ cloud_provider: 'GCP' }, () => false)
    .with({ cloud_provider: 'ON_PREMISE' }, () => false)
    .with({ cloud_provider: 'AWS', instance_type: 'KARPENTER' }, () => false)
    .otherwise(() => true)

  const totalNodes = (!shouldDisplayMinMaxNodes ? runningStatus?.nodes?.length : cluster?.max_running_nodes) || 0

  const healthyNodes =
    runningStatus?.nodes?.filter(
      (node) => node.conditions?.find((condition) => condition.type === 'Ready')?.status === 'True'
    ).length || 0

  const warningNodes = Object.keys(runningStatus?.computed_status?.node_warnings || {}).length || 0

  const deployingNodes =
    runningStatus?.nodes?.filter(
      (node) => node.conditions?.find((condition) => condition.type === 'Ready')?.status === 'False'
    ).length || 0

  const healthyPercentage = calculatePercentage(healthyNodes, totalNodes)
  const warningPercentage = calculatePercentage(warningNodes, totalNodes)
  const deployingPercentage = calculatePercentage(deployingNodes, totalNodes)

  const tooltipContent = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center">
        <div className="flex w-full items-center gap-1.5">
          <Icon iconName="check-circle" iconStyle="regular" className="text-green-400" />
          <span>Healthy {pluralize(healthyNodes - warningNodes, 'node', 'nodes')}</span>
          <span className="ml-auto block font-semibold">{healthyNodes - warningNodes}</span>
        </div>
      </div>
      {warningNodes > 0 && (
        <div className="flex w-full items-center gap-1.5">
          <Icon iconName="exclamation-circle" iconStyle="regular" className="text-yellow-500" />
          <span>Warning {pluralize(warningNodes, 'node', 'nodes')}</span>
          <span className="ml-auto block font-semibold">{warningNodes}</span>
        </div>
      )}
      {deployingNodes > 0 && (
        <div className="flex w-full items-center gap-1.5">
          <Icon iconName="exclamation-circle" iconStyle="regular" className="text-brand-300" />
          <span>Deploying {pluralize(deployingNodes, 'node', 'nodes')}</span>
          <span className="ml-auto block font-semibold">{deployingNodes}</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col justify-between rounded border border-neutral-250 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-350">Nodes usage</p>
          <Skeleton
            width={32}
            height={32}
            show={!cluster || runningStatusNotAvailable}
            className={!cluster || runningStatusNotAvailable ? 'mt-1' : ''}
            rounded
          >
            <span className="text-[28px] font-bold text-neutral-400">{runningStatus?.nodes?.length}</span>
          </Skeleton>
        </div>
        {match(cluster?.cloud_provider)
          .with('GCP', () => null)
          .with('ON_PREMISE', () => null)
          .otherwise(() => (
            <Link
              color="current"
              to={CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_RESOURCES_URL}
            >
              <Icon iconName="gear" iconStyle="regular" className="text-base text-neutral-300" />
            </Link>
          ))}
      </div>
      <Skeleton width="100%" height={20} show={!cluster || runningStatusNotAvailable}>
        <div className="flex w-full flex-col gap-2.5">
          {shouldDisplayMinMaxNodes && (
            <div className="flex items-center justify-between text-sm text-neutral-350">
              <span>min: {cluster?.min_running_nodes}</span>
              <span>max: {cluster?.max_running_nodes}</span>
            </div>
          )}
          <Tooltip content={tooltipContent} classNameContent="w-[157px] px-2.5 py-1.5">
            <ProgressBar.Root>
              {deployingPercentage > 0 && (
                <ProgressBar.Cell percentage={deployingPercentage} color="var(--color-brand-500" />
              )}
              {healthyPercentage > 0 && (
                <ProgressBar.Cell percentage={healthyPercentage} color="var(--color-green-500)" />
              )}
              {warningPercentage > 0 && (
                <ProgressBar.Cell percentage={warningPercentage} color="var(--color-yellow-500)" />
              )}
            </ProgressBar.Root>
          </Tooltip>
        </div>
      </Skeleton>
    </div>
  )
}

export default ClusterCardNodeUsage
