import { useMemo } from 'react'
import { Line } from 'recharts'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../../../local-chart/local-chart'
import { addTimeRangePadding } from '../../../util-chart/add-time-range-padding'
import { processMetricsData } from '../../../util-chart/process-metrics-data'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

const queryDiskReadNvme = (containerName: string, podNames?: string[]) => {
  if (podNames && podNames.length > 0) {
    const podFilter = podNames.join('|')
    return `sum (rate(container_fs_reads_bytes_total{pod=~"${podFilter}", device=~"/dev/nvme.*"}[1m]))`
  }
  return `sum by (device) (rate(container_fs_reads_bytes_total{container="${containerName}", device=~"/dev/nvme.*"}[1m]))`
}

const queryDiskReadNonNvme = (containerName: string, podNames?: string[]) => {
  if (podNames && podNames.length > 0) {
    const podFilter = podNames.join('|')
    return `sum by (device) (rate(container_fs_reads_bytes_total{pod=~"${podFilter}", device!~"/dev/nvme.*", device!=""}[1m]))`
  }
  return `sum by (device) (rate(container_fs_reads_bytes_total{container="${containerName}", device!~"/dev/nvme.*", device!=""}[1m]))`
}

const queryDiskWriteNvme = (containerName: string, podNames?: string[]) => {
  if (podNames && podNames.length > 0) {
    const podFilter = podNames.join('|')
    return `sum by (device) (rate(container_fs_writes_bytes_total{pod=~"${podFilter}", device=~"/dev/nvme.*"}[1m]))`
  }
  return `sum by (device) (rate(container_fs_writes_bytes_total{container="${containerName}", device=~"/dev/nvme.*"}[1m]))`
}

const queryDiskWriteNonNvme = (containerName: string, podNames?: string[]) => {
  if (podNames && podNames.length > 0) {
    const podFilter = podNames.join('|')
    return `sum by (device) (rate(container_fs_writes_bytes_total{pod=~"${podFilter}", device!~"/dev/nvme.*", device!=""}[1m]))`
  }
  return `sum by (device) (rate(container_fs_writes_bytes_total{container="${containerName}", device!~"/dev/nvme.*", device!=""}[1m]))`
}

export function DiskChart({
  clusterId,
  serviceId,
  containerName,
  podNames,
}: {
  clusterId: string
  serviceId: string
  containerName: string
  podNames?: string[]
}) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useDashboardContext()

  const { data: metricsReadEphemeralStorage, isLoading: isLoadingMetricsReadEphemeralStorage } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryDiskReadNvme(containerName, podNames),
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'disk_chart_read_ephemeral',
  })

  const { data: metricsReadPersistentStorage, isLoading: isLoadingMetricsReadPersistentStorage } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryDiskReadNonNvme(containerName, podNames),
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'disk_chart_read_persistent',
  })

  const { data: metricsWriteEphemeralStorage, isLoading: isLoadingMetricsWriteEphemeralStorage } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryDiskWriteNvme(containerName, podNames),
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'disk_chart_read_ephemeral',
  })

  const { data: metricsWritePersistentStorage, isLoading: isLoadingMetricsWritePersistentStorage } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryDiskWriteNonNvme(containerName, podNames),
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'disk_chart_write_persistent',
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
  const maxAbs = useMemo(() => {
    return chartData.length
      ? Math.max(
          ...chartData.flatMap((d) => [
            Math.abs(Number(d['read-ephemeral-storage'] ?? 0)),
            Math.abs(Number(d['read-persistent-storage'] ?? 0)),
            Math.abs(Number(d['write-ephemeral-storage'] ?? 0)),
            Math.abs(Number(d['write-persistent-storage'] ?? 0)),
          ])
        )
      : 1
  }, [chartData])

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
      label="Storage usage (MiB/sec)"
      description="Usage per instance in MiB/sec of storage capacity with read and write operations"
      tooltipLabel="Storage I/O"
      serviceId={serviceId}
      yDomain={yDomain}
    >
      <Line
        dataKey="read-ephemeral-storage"
        name="read-ephemeral-storage"
        type="linear"
        stroke="var(--color-green-500)"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />
      <Line
        dataKey="read-persistent-storage"
        name="read-persistent-storage"
        type="linear"
        stroke="var(--color-green-700)"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />
      <Line
        dataKey="write-ephemeral-storage"
        name="write-ephemeral-storage"
        type="linear"
        stroke="var(--color-yellow-500)"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />
      <Line
        dataKey="write-persistent-storage"
        name="write-persistent-storage"
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
