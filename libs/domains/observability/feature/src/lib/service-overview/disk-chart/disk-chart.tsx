import { useMemo } from 'react'
import { Line } from 'recharts'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function DiskChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const { startTimestamp, endTimestamp, useLocalTime } = useServiceOverviewContext()

  const { data: metricsReadEphemeralStorage, isLoading: isLoadingMetricsReadEphemeralStorage } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by (pod, device) (rate(container_fs_reads_bytes_total{container!="", pod=~".+", device=""}[1m]) and on(namespace, pod) (max by (namespace, pod) (kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}) > 0))`,
  })

  const { data: metricsReadPersistentStorage, isLoading: isLoadingMetricsReadPersistentStorage } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by (pod, device) (rate(container_fs_reads_bytes_total{container!="", pod=~".+",   device=~"/dev/nvme.*"}[1m]) and on(namespace, pod) (max by (namespace, pod) (kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}) > 0))`,
  })

  const { data: metricsWriteEphemeralStorage, isLoading: isLoadingMetricsWriteEphemeralStorage } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by (pod, device) (rate(container_fs_writes_bytes_total{container!="", pod=~".+", device=""}[1m]) and on(namespace, pod) (max by (namespace, pod) (kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}) > 0))`,
  })

  const { data: metricsWritePersistentStorage, isLoading: isLoadingMetricsWritePersistentStorage } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by (pod, device) (rate(container_fs_writes_bytes_total{container!="", pod=~".+",   device=~"/dev/nvme.*"}[1m]) and on(namespace, pod) (max by (namespace, pod) (kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}) > 0))`,
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
      (value) => parseFloat(value) / 1024 / 1024, // Convert to MiB
      useLocalTime
    )

    // Process write persistent storage metrics
    processMetricsData(
      metricsWritePersistentStorage,
      timeSeriesMap,
      () => 'write-persistent-storage',
      (value) => parseFloat(value) / 1024, // Convert to MiB
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

  return (
    <LocalChart
      data={chartData}
      unit="MiB"
      isLoading={
        isLoadingMetricsReadEphemeralStorage ||
        isLoadingMetricsReadPersistentStorage ||
        isLoadingMetricsWriteEphemeralStorage ||
        isLoadingMetricsWritePersistentStorage
      }
      isEmpty={chartData.length === 0}
      label="Disk usage (MiB)"
      serviceId={serviceId}
      clusterId={clusterId}
    >
      <Line
        dataKey="read-ephemeral-storage"
        type="linear"
        stroke="var(--color-brand-300)"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />
      <Line
        dataKey="read-persistent-storage"
        type="linear"
        stroke="var(--color-purple-300)"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />
      <Line
        dataKey="write-ephemeral-storage"
        type="linear"
        stroke="var(--color-green-600)"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />
      <Line
        dataKey="write-persistent-storage"
        type="linear"
        stroke="var(--color-purple-700)"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />
    </LocalChart>
  )
}

export default DiskChart
