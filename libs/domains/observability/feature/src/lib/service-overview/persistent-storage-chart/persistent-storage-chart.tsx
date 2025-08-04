import { useMemo } from 'react'
import { Line } from 'recharts'
import { match } from 'ts-pattern'
import { useService } from '@qovery/domains/services/feature'
import { usePodColor } from '@qovery/shared/util-hooks'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryVolumeUsage = (serviceId: string): string => `
  sum by (persistentvolumeclaim) (
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
)
`

export function PersistentStorageChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const { data: service } = useService({ serviceId })
  const getColorByVolume = usePodColor()
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useServiceOverviewContext()

  const buildVolumeQuery = (serviceId: string, storage: { id: string; mount_point: string }[]): string => {
    // Base PromQL ratio expression
    let promQL: string = queryVolumeUsage(serviceId)

    // Inject label_replace for each known volume id
    for (const { id, mount_point } of storage) {
      promQL = `label_replace(
      ${promQL},
      "persistentvolumeclaim", "${mount_point}", "persistentvolumeclaim", "^${id}.*"
    )`
    }

    return promQL
  }

  const storage = match(service)
    .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (service) => service.storage ?? [])
    .otherwise(() => [])

  const finalQuery = buildVolumeQuery(serviceId, storage)

  const { data: metricsVolumeUsed, isLoading: isLoadingVolumeUsed } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: finalQuery,
  })

  const chartData = useMemo(() => {
    // Merge healthy and unhealthy metrics into a single timeSeriesMap
    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process Volume used
    if (metricsVolumeUsed?.data?.result) {
      processMetricsData(
        metricsVolumeUsed,
        timeSeriesMap,
        (_, index) => metricsVolumeUsed.data.result[index].metric.persistentvolumeclaim,
        (value) => parseFloat(value),
        useLocalTime
      )
    }

    // Convert map to sorted array and add time range padding
    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)
    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metricsVolumeUsed, useLocalTime, startTimestamp, endTimestamp])

  const seriesNames = useMemo(() => {
    if (!metricsVolumeUsed?.data?.result) return []
    return metricsVolumeUsed.data.result.map(
      (_: unknown, index: number) => metricsVolumeUsed.data.result[index].metric.persistentvolumeclaim
    ) as string[]
  }, [metricsVolumeUsed])

  return (
    <LocalChart
      data={chartData || []}
      isLoading={isLoadingVolumeUsed}
      isEmpty={(chartData || []).length === 0}
      tooltipLabel="Storage Usage"
      unit="%"
      serviceId={serviceId}
      margin={{ top: 14, bottom: 0, left: 0, right: 0 }}
      yDomain={[0, 110]}
      isFullscreen
    >
      {seriesNames.map((name) => (
        <Line
          key={name}
          dataKey={name}
          stroke={getColorByVolume(name)}
          fillOpacity={0.3}
          isAnimationActive={false}
          dot={false}
          strokeWidth={2}
        />
      ))}
    </LocalChart>
  )
}

export default PersistentStorageChart
