import { useMemo } from 'react'
import { Bar, Scatter } from 'recharts'
import type { ScatterProps } from 'recharts'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

function calculateDynamicRange(startTimestamp: string, endTimestamp: string): string {
  const startMs = Number(startTimestamp) * 1000
  const endMs = Number(endTimestamp) * 1000
  const durationMs = endMs - startMs
  const durationHours = durationMs / (1000 * 60 * 60)
  const durationDays = durationHours / 24

  // Calculate range based on time range duration with appropriate scaling
  let rangeMinutes: number

  if (durationDays >= 7) {
    // For 7+ days: 4 hours
    rangeMinutes = 4 * 60
  } else if (durationDays >= 2) {
    // For 2-7 days: 2 hours
    rangeMinutes = 2 * 60
  } else if (durationDays >= 1) {
    // For 1-2 days: 1 hour
    rangeMinutes = 60
  } else if (durationHours >= 6) {
    // For 6-24 hours: 30 minutes
    rangeMinutes = 30
  } else if (durationHours >= 3) {
    // For 3-6 hours: 15 minutes
    rangeMinutes = 15
  } else if (durationHours >= 1) {
    // For 1-3 hours: 10 minutes
    rangeMinutes = 10
  } else {
    // For less than 1 hour: 5 minutes minimum
    rangeMinutes = 5
  }

  return `${rangeMinutes}m`
}

export function InstanceStatusChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const { startTimestamp, endTimestamp, useLocalTime } = useServiceOverviewContext()

  // Calculate dynamic range based on time range
  const dynamicRange = useMemo(
    () => calculateDynamicRange(startTimestamp, endTimestamp),
    [startTimestamp, endTimestamp]
  )

  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `
      sum by (condition)(
        max_over_time(
          (
            kube_pod_status_ready{condition=~"true|false"}
            * on(namespace,pod) group_left(label_qovery_com_service_id)
              max by(namespace,pod,label_qovery_com_service_id)(
                kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}
              )
          )[${dynamicRange}:]
        )
      )`,
  })

  const intervalMs = 15000

  const { data: metricsErrors, isLoading: isLoadingMetricsErrors } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by (reason)((
        kube_pod_container_status_last_terminated_reason{} == 1
      )
      * on(namespace, pod) group_left(label_qovery_com_service_id)
        kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}
      unless on(namespace, pod, reason)
      (
        (
          kube_pod_container_status_last_terminated_reason{} offset ${intervalMs}ms == 1
        )
        * on(namespace, pod) group_left(label_qovery_com_service_id)
          kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}
      ))`,
  })

  const chartData = useMemo(() => {
    if (!metrics?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process regular instance status metrics (pods) - healthy vs unhealthy
    processMetricsData(
      metrics,
      timeSeriesMap,
      (_, index) =>
        metrics.data.result[index].metric.condition === 'false' ? 'Instance unhealthy' : 'Instance healthy',
      (value) => parseFloat(value),
      useLocalTime
    )

    // Process instance errors and map them to the closest unhealthy timestamp
    if (metricsErrors?.data?.result) {
      const chartTimestamps = Array.from(timeSeriesMap.keys())
      if (chartTimestamps.length === 0) return

      metricsErrors.data.result.forEach((series: { metric: { reason: string }; values: [number, string][] }) => {
        const seriesName = series.metric.reason
        series.values.forEach(([timestamp, value]: [number, string]) => {
          const timestampNum = timestamp * 1000 // Convert to ms

          // Find timestamps where instances were unhealthy to place error icons
          const unhealthyTimestamps = chartTimestamps.filter((ts) => {
            const point = timeSeriesMap.get(ts)
            return point && point['Instance unhealthy']
          })

          if (unhealthyTimestamps.length === 0) return // No unhealthy instances to attach errors to

          // Find the closest unhealthy timestamp to place the error icon
          let targetTimestamp = unhealthyTimestamps[0]
          let minDiff = Math.abs(targetTimestamp - timestampNum)
          for (const ts of unhealthyTimestamps) {
            const diff = Math.abs(ts - timestampNum)
            if (diff < minDiff) {
              minDiff = diff
              targetTimestamp = ts
            }
          }

          // Add error data to the closest unhealthy point
          const dataPoint = timeSeriesMap.get(targetTimestamp)!
          dataPoint[seriesName] = parseFloat(value)

          // Also add Completed if not already set (for consistency)
          if (seriesName !== 'Completed') {
            dataPoint['Completed'] = parseFloat(value)
          }
        })
      })
    }

    // Convert map to sorted array and add time range padding
    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    // Add padding to the time range for better visualization
    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metrics, metricsErrors, useLocalTime, startTimestamp, endTimestamp])

  // Extract error series names from metrics data
  const seriesNames = useMemo(() => {
    if (!metricsErrors?.data?.result) return []
    return metricsErrors.data.result.map(
      (_: unknown, index: number) => metricsErrors.data.result[index].metric.reason
    ) as string[]
  }, [metricsErrors])

  // Filter to only include series that have actual data points in the chart
  const validSeriesNames = useMemo(() => {
    if (!(chartData || []).length || !seriesNames.length) return []

    const validNames = seriesNames.filter((name) => {
      return (chartData || []).some((point) => {
        const value = point[name]
        return value !== null && value !== undefined && typeof value === 'number' && value > 0
      })
    })

    return validNames
  }, [seriesNames, chartData])

  return (
    <LocalChart
      data={chartData || []}
      isLoading={isLoadingMetrics || isLoadingMetricsErrors}
      isEmpty={(chartData || []).length === 0}
      tooltipLabel="Instance issues"
      unit="instance"
      serviceId={serviceId}
      clusterId={clusterId}
      yDomain={[0, 'dataMax + 1']}
    >
      <Bar
        key="false"
        barSize={30}
        stackId="stack"
        dataKey="Instance unhealthy"
        fill="var(--color-red-500)"
        isAnimationActive={false}
      />
      <Bar
        key="true"
        barSize={30}
        stackId="stack"
        dataKey="Instance healthy"
        fill="var(--color-green-500)"
        isAnimationActive={false}
      />
      {validSeriesNames.map((name) => (
        <Scatter
          key={name}
          name={name}
          dataKey={name}
          isAnimationActive={false}
          fill="var(--color-red-400)"
          shape={(props: ScatterProps) => {
            const cx = Number(props.cx ?? 0)
            const cy = Number(props.cy ?? 0)
            return (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x={cx - 10}
                y={cy - 20}
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 20 20"
                style={{ pointerEvents: 'none' }}
              >
                <path fill="#FF6240" d="M0 10C0 4.477 4.477 0 10 0s10 4.477 10 10-4.477 10-10 10S0 15.523 0 10"></path>
                <g clipPath="url(#clip0_25163_80956)">
                  <path
                    fill="#fff"
                    d="M7.938 5.875a.56.56 0 0 0-.563.563v7.125c0 .196-.033.386-.096.562h7.034c.311 0 .562-.25.562-.562V6.437a.56.56 0 0 0-.562-.562zm-2.25 9.375A1.686 1.686 0 0 1 4 13.563V6.625c0-.312.25-.562.563-.562.311 0 .562.25.562.562v6.938c0 .311.25.562.563.562.311 0 .562-.25.562-.562V6.437c0-.932.755-1.687 1.688-1.687h6.375c.932 0 1.687.755 1.687 1.688v7.125c0 .932-.755 1.687-1.687 1.687zm2.437-8.062c0-.312.25-.563.563-.563h2.25c.311 0 .562.25.562.563v1.875c0 .311-.25.562-.562.562h-2.25a.56.56 0 0 1-.563-.562zm4.688-.563h.75c.311 0 .562.25.562.563 0 .311-.25.562-.562.562h-.75a.56.56 0 0 1-.563-.562c0-.312.25-.563.563-.563m0 1.875h.75c.311 0 .562.25.562.563 0 .311-.25.562-.562.562h-.75a.56.56 0 0 1-.563-.562c0-.312.25-.563.563-.563m-4.126 1.875h4.876c.311 0 .562.25.562.563 0 .311-.25.562-.562.562H8.686a.56.56 0 0 1-.562-.562c0-.312.25-.563.563-.563m0 1.875h4.876c.311 0 .562.25.562.563 0 .311-.25.562-.562.562H8.686a.56.56 0 0 1-.562-.562c0-.312.25-.563.563-.563"
                  ></path>
                </g>
                <defs>
                  <clipPath id="clip0_25163_80956">
                    <path fill="#fff" d="M4 4h12v12H4z"></path>
                  </clipPath>
                </defs>
              </svg>
            )
          }}
        />
      ))}
    </LocalChart>
  )
}

export default InstanceStatusChart
