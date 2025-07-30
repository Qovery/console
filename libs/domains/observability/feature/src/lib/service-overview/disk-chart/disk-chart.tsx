import { useMemo } from 'react'
import { Line } from 'recharts'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function DiskChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useServiceOverviewContext()

  const { data: metricsReadEphemeralStorage, isLoading: isLoadingMetricsReadEphemeralStorage } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by (namespace, pod, device) (rate(container_fs_reads_bytes_total{container!="", pod=~".+", device=~"/dev/nvme0.*"}[1m])) * on(namespace, pod) group_left(label_qovery_com_service_id) max by (namespace, pod) (kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"})`,
    timeRange,
  })

  const { data: metricsReadPersistentStorage, isLoading: isLoadingMetricsReadPersistentStorage } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by (namespace, pod, device) (rate(container_fs_reads_bytes_total{container="", pod=~".+", device!~"/dev/nvme0.*", device!=""}[1m])) * on(namespace, pod) group_left(label_qovery_com_service_id) max by (namespace, pod) (kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"})`,
    timeRange,
  })

  const { data: metricsWriteEphemeralStorage, isLoading: isLoadingMetricsWriteEphemeralStorage } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by (namespace, pod, device) (rate(container_fs_writes_bytes_total{container!="", pod=~".+", device=~"/dev/nvme0.*"}[1m])) * on(namespace, pod) group_left(label_qovery_com_service_id) max by (namespace, pod) (kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"})`,
    timeRange,
  })

  const { data: metricsWritePersistentStorage, isLoading: isLoadingMetricsWritePersistentStorage } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by (namespace, pod, device) (rate(container_fs_writes_bytes_total{container="", pod=~".+", device!~"/dev/nvme0.*", device!=""}[1m])) * on(namespace, pod) group_left(label_qovery_com_service_id) max by (namespace, pod) (kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"})`,
    timeRange,
  })

  const chartData = useMemo(() => {
    if (!metricsReadEphemeralStorage?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process read ephemeral storage metrics
    processMetricsData(
      metricsReadEphemeralStorage,
      timeSeriesMap,
      () => 'read-ephemeral-storage',
      (value) => parseFloat(value) / 1024 / 1024, // Convert to MiB
      useLocalTime
    )

    // Process read persistent storage metrics
    processMetricsData(
      metricsReadPersistentStorage,
      timeSeriesMap,
      () => 'read-persistent-storage',
      (value) => parseFloat(value) / 1024 / 1024, // Convert to MiB
      useLocalTime
    )

    // Process write ephemeral storage metrics
    processMetricsData(
      metricsWriteEphemeralStorage,
      timeSeriesMap,
      () => 'write-ephemeral-storage',
      (value) => -parseFloat(value) / 1024 / 1024, // Mirror by multiplying by -1 (MiB)
      useLocalTime
    )

    // Process write persistent storage metrics
    processMetricsData(
      metricsWritePersistentStorage,
      timeSeriesMap,
      () => 'write-persistent-storage',
      (value) => -parseFloat(value) / 1024 / 1024, // Mirror by multiplying by -1 (MiB)
      useLocalTime
    )

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [
    metricsReadEphemeralStorage,
    metricsReadPersistentStorage,
    metricsWriteEphemeralStorage,
    metricsWritePersistentStorage,
    useLocalTime,
    startTimestamp,
    endTimestamp,
  ])

  // Calculate symmetric yDomain
  const maxAbs = chartData.length
    ? Math.max(
        ...chartData.flatMap((d) => [
          Math.abs(Number(d['read-ephemeral-storage'] ?? 0)),
          Math.abs(Number(d['read-persistent-storage'] ?? 0)),
          Math.abs(Number(d['write-ephemeral-storage'] ?? 0)),
          Math.abs(Number(d['write-persistent-storage'] ?? 0)),
        ])
      )
    : 1
  const yDomain: [number, number] = [-Math.round(maxAbs), Math.round(maxAbs)]

  return (
    <LocalChart
      data={chartData}
      unit="MiB/sec"
      isLoading={
        isLoadingMetricsReadEphemeralStorage ||
        isLoadingMetricsReadPersistentStorage ||
        isLoadingMetricsWriteEphemeralStorage ||
        isLoadingMetricsWritePersistentStorage
      }
      isEmpty={chartData.length === 0}
      label="Storage I/O (MiB/sec)"
      description="Storage I/O: read/write ephemeral storage, read/write persistent storage"
      tooltipLabel="Storage I/O"
      serviceId={serviceId}
      yDomain={yDomain}
    >
      <Line
        dataKey="read-ephemeral-storage"
        type="linear"
        stroke="var(--color-green-500)"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />
      <Line
        dataKey="read-persistent-storage"
        type="linear"
        stroke="var(--color-green-700)"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />
      <Line
        dataKey="write-ephemeral-storage"
        type="linear"
        stroke="var(--color-yellow-500)"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />
      <Line
        dataKey="write-persistent-storage"
        type="linear"
        stroke="var(--color-yellow-700)"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />
    </LocalChart>
  )
}

export default DiskChart
