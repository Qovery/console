import { useMemo, useState } from 'react'
import { type LegendPayload, Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { getColorByPod } from '@qovery/shared/util-hooks'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const query = (ingressName: string) => `
   sum by(path,status)(nginx:req_rate:5m_by_path_status{ingress="${ingressName}"}) > 0
`

export function NetworkRequestStatusChart({
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

  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: query(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_req_status',
  })

  const chartData = useMemo(() => {
    if (!metrics?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process network request metrics
    processMetricsData(
      metrics,
      timeSeriesMap,
      (_, index) => JSON.stringify(metrics.data.result[index].metric),
      (value) => parseFloat(value),
      useLocalTime
    )

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metrics, useLocalTime, startTimestamp, endTimestamp])

  const seriesNames = useMemo(() => {
    if (!metrics?.data?.result) return []
    return metrics.data.result.map((_: unknown, index: number) =>
      JSON.stringify(metrics.data.result[index].metric)
    ) as string[]
  }, [metrics])

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoadingMetrics}
      isEmpty={chartData.length === 0}
      label="Network request status (req/s)"
      description="Sudden drops or spikes may signal service instability"
      unit="req/s"
      serviceId={serviceId}
      handleResetLegend={legendSelectedKeys.size > 0 ? handleResetLegend : undefined}
    >
      {seriesNames.map((name) => (
        <Line
          key={name}
          dataKey={name}
          type="linear"
          stroke={getColorByPod(name)}
          strokeWidth={2}
          dot={false}
          connectNulls={false}
          isAnimationActive={false}
          hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has(name) ? true : false}
        />
      ))}
      {!isLoadingMetrics && chartData.length > 0 && (
        <Chart.Legend
          name="network-request-status"
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          onClick={onClick}
          content={(props) => (
            <Chart.LegendContent
              selectedKeys={legendSelectedKeys}
              formatter={(value: string) => {
                const { path, status } = JSON.parse(value)
                return `path: "${path}" status: "${status}"`
              }}
              {...props}
            />
          )}
        />
      )}
    </LocalChart>
  )
}

export default NetworkRequestStatusChart
