import { useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { CLUSTER_SETTINGS_RESOURCES_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { Icon, Link } from '@qovery/shared/ui'

export interface CardNodeUsageProps {
  organizationId: string
  clusterId: string
}

export function CardNodeUsage({ organizationId, clusterId }: CardNodeUsageProps) {
  const { data: runningStatus } = useClusterRunningStatus({
    organizationId: organizationId,
    clusterId: clusterId,
  })

  return (
    <div className="rounded border border-neutral-250 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-350">Nodes usages</p>
          <span className="text-[28px] font-bold text-neutral-400">{runningStatus?.nodes.length ?? 0}</span>
        </div>
        <Link
          color="current"
          to={CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_RESOURCES_URL}
        >
          <Icon iconName="gear" iconStyle="regular" className="text-base text-neutral-300" />
        </Link>
      </div>
    </div>
  )
}

export default CardNodeUsage
