import { useMemo } from 'react'
import { Line } from 'recharts'
import { usePodColor } from '@qovery/shared/util-hooks'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function PersistentStorageChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const getColorByVolume = usePodColor()
  const { startTimestamp, endTimestamp, useLocalTime } = useServiceOverviewContext()

  const { data: metricsVolumeUsed, isLoading: isLoadingVolumeUsed } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by (persistentvolumeclaim) (
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
)`,
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
      tooltipLabel="Volume Used"
      unit="%"
      serviceId={serviceId}
      margin={{ top: 14, bottom: 0, left: 0, right: 0 }}
      yDomain={[0, '110']}
      referenceLineData={[]}
      isFullscreen={true}
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
