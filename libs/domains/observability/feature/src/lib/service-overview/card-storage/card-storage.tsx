import { useState } from 'react'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { ModalChart } from '../modal-chart/modal-chart'
import { PersistentStorageChart } from '../persistent-storage-chart/persistent-storage-chart'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function CardStorage({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { timeRange } = useServiceOverviewContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: `
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
))`,
    queryRange: 'query',
  })

  const value = Math.round(metrics?.data?.result[0]?.value[1]) ?? 0
  const isError = value > 80

  const title = `Storage Usage`

  return (
    <>
      <CardMetric
        title={title}
        value={`${value}%`}
        status={isError ? 'RED' : 'GREEN'}
        description={`in the last ${timeRange}`}
        isLoading={isLoadingMetrics}
        onClick={() => setIsModalOpen(true)}
        hasModalLink
      />
      {isModalOpen && (
        <ModalChart
          title={title}
          description="The storage usage over time."
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
