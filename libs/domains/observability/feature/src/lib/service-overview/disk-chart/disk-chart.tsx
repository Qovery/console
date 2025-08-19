import { useCallback, useMemo } from 'react'
import { Line } from 'recharts'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { useOptimizedChartData } from '../util-chart/optimized-chart-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryDiskReadNvme = (serviceId: string) => `
  sum by (namespace, pod, device) (rate(container_fs_reads_bytes_total{container!="", pod=~".+", device=~"/dev/nvme0.*"}[1m])) * on(namespace, pod) group_left(label_qovery_com_service_id) max by(namespace, pod, label_qovery_com_service_id) (kube_pod_labels{label_qovery_com_service_id="${serviceId}"})
`

const queryDiskReadNonNvme = (serviceId: string) => `
  sum by (namespace, pod, device) (rate(container_fs_reads_bytes_total{container="", pod=~".+", device!~"/dev/nvme0.*", device!=""}[1m])) * on(namespace, pod) group_left(label_qovery_com_service_id) max by(namespace, pod, label_qovery_com_service_id) (kube_pod_labels{label_qovery_com_service_id="${serviceId}"})
`

const queryDiskWriteNvme = (serviceId: string) => `
  sum by (namespace, pod, device) (rate(container_fs_writes_bytes_total{container!="", pod=~".+", device=~"/dev/nvme0.*"}[1m])) * on(namespace, pod) group_left(label_qovery_com_service_id) max by(namespace, pod, label_qovery_com_service_id) (kube_pod_labels{label_qovery_com_service_id="${serviceId}"})
`

const queryDiskWriteNonNvme = (serviceId: string) => `
  sum by (namespace, pod, device) (rate(container_fs_writes_bytes_total{container="", pod=~".+", device!~"/dev/nvme0.*", device!=""}[1m])) * on(namespace, pod) group_left(label_qovery_com_service_id) max by(namespace, pod, label_qovery_com_service_id) (kube_pod_labels{label_qovery_com_service_id="${serviceId}"})
`

export function DiskChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useServiceOverviewContext()

  const { data: metricsReadEphemeralStorage, isLoading: isLoadingMetricsReadEphemeralStorage } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryDiskReadNvme(serviceId),
    timeRange,
  })

  const { data: metricsReadPersistentStorage, isLoading: isLoadingMetricsReadPersistentStorage } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryDiskReadNonNvme(serviceId),
    timeRange,
  })

  const { data: metricsWriteEphemeralStorage, isLoading: isLoadingMetricsWriteEphemeralStorage } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryDiskWriteNvme(serviceId),
    timeRange,
  })

  const { data: metricsWritePersistentStorage, isLoading: isLoadingMetricsWritePersistentStorage } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryDiskWriteNonNvme(serviceId),
    timeRange,
  })

  // Memoize transform functions to prevent recreation
  const readTransformValue = useCallback((value: string) => parseFloat(value) / 1024 / 1024, []) // Convert to MiB
  const writeTransformValue = useCallback((value: string) => -parseFloat(value) / 1024 / 1024, []) // Mirror writes
  const getSeriesName = useCallback(() => 'read-ephemeral-storage', []) // Primary series

  // Use optimized chart data processing with additional processors
  const { chartData } = useOptimizedChartData({
    metrics: metricsReadEphemeralStorage, // Use read ephemeral as primary
    serviceId,
    useLocalTime,
    startTimestamp,
    endTimestamp,
    transformValue: readTransformValue,
    getSeriesName,
    additionalProcessors: [
      {
        metrics: metricsReadPersistentStorage,
        getSeriesName: () => 'read-persistent-storage',
        transformValue: readTransformValue,
      },
      {
        metrics: metricsWriteEphemeralStorage,
        getSeriesName: () => 'write-ephemeral-storage',
        transformValue: writeTransformValue,
      },
      {
        metrics: metricsWritePersistentStorage,
        getSeriesName: () => 'write-persistent-storage',
        transformValue: writeTransformValue,
      },
    ],
  })

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
