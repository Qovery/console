import { useState } from 'react'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { ModalChart } from '../modal-chart/modal-chart'
import { PersistentStorageChart } from '../persistent-storage-chart/persistent-storage-chart'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryPercentage = (serviceId: string, timeRange: string) => `
  max (max_over_time(
  (
    (
      kubelet_volume_stats_used_bytes
      * on(namespace, persistentvolumeclaim)
        group_left(label_qovery_com_service_id)
          max by (namespace, persistentvolumeclaim)(kube_persistentvolumeclaim_labels{label_qovery_com_service_id="${serviceId}"})
    )
    /
    (
      kubelet_volume_stats_capacity_bytes
      * on(namespace, persistentvolumeclaim)
        group_left(label_qovery_com_service_id)
          max by (namespace, persistentvolumeclaim)(kube_persistentvolumeclaim_labels{label_qovery_com_service_id="${serviceId}"})
    ) * 100
  )[${timeRange}:1m]
))
`

const queryMaxStorage = (serviceId: string, timeRange: string) => `
  max (max_over_time(
  (
    (
      kubelet_volume_stats_used_bytes
      * on(namespace, persistentvolumeclaim)
        group_left(label_qovery_com_service_id)
          max by (namespace, persistentvolumeclaim)(kube_persistentvolumeclaim_labels{label_qovery_com_service_id="${serviceId}"})
    )
  )[${timeRange}:1m]
))

`

export function CardStorage({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { queryTimeRange } = useServiceOverviewContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: metricsPercentage, isLoading: isLoadingMetricsPercentage } = useMetrics({
    clusterId,
    query: queryPercentage(serviceId, queryTimeRange),
    queryRange: 'query',
  })

  const { data: metricsMaxStorage, isLoading: isLoadingMetricsMaxStorage } = useMetrics({
    clusterId,
    query: queryMaxStorage(serviceId, queryTimeRange),
    queryRange: 'query',
  })

  const rawValue = Number(metricsPercentage?.data?.result[0]?.value[1])
  const value = Number.isFinite(rawValue) ? Math.round(rawValue) : 0

  const maxUsageBytes = Number(metricsMaxStorage?.data?.result[0]?.value[1])

  const maxUsageGiB = maxUsageBytes / (1024 * 1024 * 1024)
  const maxUsageMiB = maxUsageBytes / (1024 * 1024)
  const maxUsageKiB = maxUsageBytes / 1024

  let maxUsageDisplay
  let maxUsageUnit
  if (maxUsageGiB >= 1) {
    maxUsageDisplay = maxUsageGiB.toFixed(1)
    maxUsageUnit = 'GiB'
  } else if (maxUsageMiB >= 1) {
    maxUsageDisplay = maxUsageMiB.toFixed(0)
    maxUsageUnit = 'MiB'
  } else if (maxUsageKiB >= 1) {
    maxUsageDisplay = maxUsageKiB.toFixed(1)
    maxUsageUnit = 'KiB'
  } else {
    maxUsageDisplay = maxUsageBytes.toFixed(0)
    maxUsageUnit = 'B'
  }

  const totalStorageGiB = value > 0 ? maxUsageGiB / (value / 100) : 0

  const title = `${maxUsageDisplay} ${maxUsageUnit} max storage usage`
  const description =
    value > 0 ? `${value}% of your ${totalStorageGiB.toFixed(1)} GiB storage allowance` : `No storage usage data`

  return (
    <>
      <CardMetric
        title={title}
        description={description}
        isLoading={isLoadingMetricsPercentage || isLoadingMetricsMaxStorage}
        onClick={() => setIsModalOpen(true)}
        hasModalLink
      />
      {isModalOpen && (
        <ModalChart
          title={title}
          description="Storage usage over time."
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        >
          <div className="grid h-full grid-cols-1">
            <PersistentStorageChart clusterId={clusterId} serviceId={serviceId} />
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default CardStorage
