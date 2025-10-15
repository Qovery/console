import { useMemo, useState } from 'react'
import { type LegendPayload, Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryResponseSize = (ingressName: string) => `
  sum(nginx:resp_bytes_rate:5m{ingress="${ingressName}"})
`

const queryRequestSize = (ingressName: string) => `
   sum(nginx:req_bytes_rate:5m{ingress="${ingressName}"})
`

export function NetworkRequestSizeChart({
  clusterId,
  serviceId,
  ingressName,
}: {
  clusterId: string
  serviceId: string
  ingressName: string
}) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useServiceOverviewContext()

  const [legendSelectedKeys, setLegendSelectedKeys] = useState<Set<string>>(new Set())

  const onClick = (value: LegendPayload) => {
    if (!value?.dataKey) return
    const key = value.dataKey as string
    const newKeys = new Set(legendSelectedKeys)
    if (newKeys.has(key)) {
      newKeys.delete(key)
    } else {
      newKeys.add(key)
    }
    setLegendSelectedKeys(newKeys)
  }

  const handleResetLegend = () => {
    setLegendSelectedKeys(new Set())
  }

  const { data: metricsResponseSize, isLoading: isLoadingMetricsResponseSize } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryResponseSize(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_resp_size',
  })

  const { data: metricsRequestSize, isLoading: isLoadingMetricsRequestSize } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryRequestSize(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_req_size',
  })

  const chartData = useMemo(() => {
    if (!metricsResponseSize?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process network response size metrics
    processMetricsData(
      metricsResponseSize,
      timeSeriesMap,
      () => 'Response size',
      (value) => parseFloat(value), // Convert to bytes
      useLocalTime
    )

    // Process network request size metrics
    processMetricsData(
      metricsRequestSize,
      timeSeriesMap,
      () => 'Request size',
      (value) => parseFloat(value), // Convert to bytes
      useLocalTime
    )

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metricsResponseSize, metricsRequestSize, useLocalTime, startTimestamp, endTimestamp])

  const isLoadingMetrics = isLoadingMetricsResponseSize || isLoadingMetricsRequestSize

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoadingMetrics}
      isEmpty={chartData.length === 0}
      label="Network request size (bytes/s)"
      description="Large sizes can increase latency and bandwidth costs"
      unit="bytes"
      serviceId={serviceId}
      handleResetLegend={legendSelectedKeys.size > 0 ? handleResetLegend : undefined}
    >
      <Line
        key="response-size"
        dataKey="Response size"
        type="linear"
        stroke="var(--color-brand-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('Response size') ? true : false}
      />
      <Line
        key="request-size"
        dataKey="Request size"
        type="linear"
        stroke="var(--color-purple-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('Request size') ? true : false}
      />
      {!isLoadingMetrics && chartData.length > 0 && (
        <Chart.Legend
          name="network-request-size"
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          onClick={onClick}
          content={(props) => <Chart.LegendContent selectedKeys={legendSelectedKeys} {...props} />}
        />
      )}
    </LocalChart>
  )
}

export default NetworkRequestSizeChart
