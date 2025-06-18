import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useMemo } from 'react'
import { Icon, Skeleton } from '@qovery/shared/ui'
import { useClusterMetrics } from '../hooks/use-cluster-metrics/use-cluster-metrics'
import { type ResourcesProps, calculateClusterResources } from './calculate-cluster-resources'

export interface ClusterCardResourcesProps {
  organizationId: string
  clusterId: string
}

export function ClusterCardResources({ organizationId, clusterId }: ClusterCardResourcesProps) {
  const { data: metrics } = useClusterMetrics({
    organizationId,
    clusterId,
  })

  const clusterResources = useMemo(() => calculateClusterResources(metrics?.nodes), [metrics?.nodes])

  const resources: {
    label: string
    icon: IconName
    value: ResourcesProps
    isPercentage?: boolean
  }[] = [
    {
      label: 'CPU reserved',
      icon: 'microchip',
      value: clusterResources.cpu,
      isPercentage: true,
    },
    {
      label: 'Memory reserved',
      icon: 'memory',
      value: clusterResources.memory,
      isPercentage: true,
    },
    {
      label: 'Disk usage',
      icon: 'hard-drive',
      value: clusterResources.disk,
      isPercentage: false,
    },
  ]

  return (
    <div className="flex flex-col gap-2.5 rounded border border-neutral-250 p-4">
      <p className="text-sm text-neutral-350">Total cluster resources</p>
      <ul className="flex w-full flex-col text-sm text-neutral-400">
        {resources.map(({ label, icon, value, isPercentage }) =>
          isPercentage ? (
            <li key={label} className="grid h-8 w-full grid-cols-[1fr_auto] items-center gap-1 p-1.5">
              <span className="flex max-w-[140px] items-center gap-2.5 overflow-hidden">
                <Icon className="shrink-0 text-base text-neutral-300" iconName={icon} iconStyle="regular" />
                <span className="truncate whitespace-nowrap">{label}</span>
              </span>
              <Skeleton width={160} height={20} show={typeof metrics !== 'object' ? true : false}>
                <p className="flex items-center gap-1 text-right text-neutral-400">
                  <span className="font-medium">{value.used}</span>
                  <span className="flex items-center gap-1.5 text-neutral-350">
                    <span>
                      /{value.total} {value.unit}
                    </span>
                    <span className="block h-[3px] w-[3px] rounded-full bg-neutral-300" />
                    {value.percent}%
                  </span>
                </p>
              </Skeleton>
            </li>
          ) : (
            <li key={label} className="grid h-8 w-full grid-cols-[1fr_auto] items-center gap-1 p-1.5">
              <span className="flex max-w-[140px] items-center gap-2.5 overflow-hidden">
                <Icon className="shrink-0 text-base text-neutral-300" iconName={icon} iconStyle="regular" />
                <span className="truncate whitespace-nowrap">{label}</span>
              </span>
              <Skeleton width={160} height={20} show={typeof metrics !== 'object' ? true : false}>
                <p className="flex items-center gap-1 text-right text-neutral-400">
                  <span className="font-medium">{value.total}</span>
                  <span className="text-neutral-350">{value.unit}</span>
                </p>
              </Skeleton>
            </li>
          )
        )}
      </ul>
    </div>
  )
}

export default ClusterCardResources
