import { useMemo, useState } from 'react'
import { type LegendPayload, Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { getColorByPod } from '@qovery/shared/util-hooks'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../../../local-chart/local-chart'
import { addTimeRangePadding } from '../../../util-chart/add-time-range-padding'
import { processMetricsData } from '../../../util-chart/process-metrics-data'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

// NGINX: Query for nginx metrics (to remove when migrating to envoy)
const query = (ingressName: string) => `
   sum by(path,status)(nginx:req_rate:5m_by_path_status{ingress="${ingressName}"}) > 0
`

// ENVOY: Query for envoy metrics
const queryEnvoy = (httpRouteName: string) => `
   sum by(envoy_response_code)(envoy_proxy:req_rate:5m_by_status{httproute_name="${httpRouteName}"}) > 0
`

export function NetworkRequestStatusChart({
  clusterId,
  serviceId,
  ingressName,
  httpRouteName,
}: {
  clusterId: string
  serviceId: string
  ingressName: string
  httpRouteName: string
}) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useDashboardContext()

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

  // NGINX: Fetch nginx metrics (to remove when migrating to envoy)
  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: query(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_req_status',
  })

  // ENVOY: Fetch envoy metrics
  const { data: metricsEnvoy, isLoading: isLoadingMetricsEnvoy } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryEnvoy(httpRouteName),
    boardShortName: 'service_overview',
    metricShortName: 'envoy_req_status',
  })

  const chartData = useMemo(() => {
    // Check if we have data from either source
    if (!metrics?.data?.result && !metricsEnvoy?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // NGINX: Process nginx metrics (to remove when migrating to envoy)
    if (metrics?.data?.result) {
      processMetricsData(
        metrics,
        timeSeriesMap,
        (_, index) => JSON.stringify({ ...metrics.data.result[index].metric, source: 'nginx' }),
        (value) => parseFloat(value),
        useLocalTime
      )
    }

    // ENVOY: Process envoy metrics
    if (metricsEnvoy?.data?.result) {
      processMetricsData(
        metricsEnvoy,
        timeSeriesMap,
        (_, index) => JSON.stringify({ ...metricsEnvoy.data.result[index].metric, source: 'envoy' }),
        (value) => parseFloat(value),
        useLocalTime
      )
    }

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metrics, metricsEnvoy, useLocalTime, startTimestamp, endTimestamp])

  const seriesNames = useMemo(() => {
    const names: string[] = []

    // NGINX: Extract nginx series names (to remove when migrating to envoy)
    if (metrics?.data?.result) {
      names.push(
        ...metrics.data.result.map((_: unknown, index: number) =>
          JSON.stringify({ ...metrics.data.result[index].metric, source: 'nginx' })
        )
      )
    }

    // ENVOY: Extract envoy series names
    if (metricsEnvoy?.data?.result) {
      names.push(
        ...metricsEnvoy.data.result
          .filter((result: any) => {
            const code = result.metric?.envoy_response_code
            return code !== 'undefined' && code !== undefined && code !== ''
          })
          .map((result: any) => JSON.stringify({ ...result.metric, source: 'envoy' }))
      )
    }

    return names
  }, [metrics, metricsEnvoy])

  const isLoading = isLoadingMetrics || isLoadingMetricsEnvoy

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoading}
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
          name={name}
          type="linear"
          stroke={getColorByPod(name)}
          strokeWidth={2}
          dot={false}
          connectNulls={false}
          isAnimationActive={false}
          hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has(name)}
        />
      ))}
      {!isLoading && chartData.length > 0 && (
        <Chart.Legend
          name="network-request-status"
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          onClick={onClick}
          content={(props) => {
            // Group series by source
            const formatter = (value: string) => {
              const metric = JSON.parse(value)
              const { source } = metric

              if (source === 'nginx') {
                const { path, status } = metric
                return `path: "${path}" status: "${status}" (nginx)`
              } else {
                const { envoy_response_code } = metric
                return `status: "${envoy_response_code}" (envoy)`
              }
            }

            return <Chart.LegendContent selectedKeys={legendSelectedKeys} formatter={formatter} {...props} />
          }}
        />
      )}
    </LocalChart>
  )
}

export default NetworkRequestStatusChart
