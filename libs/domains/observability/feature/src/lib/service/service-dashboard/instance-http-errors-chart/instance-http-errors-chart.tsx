import { useMemo, useState } from 'react'
import { Area, type LegendPayload } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { getColorByPod } from '@qovery/shared/util-hooks'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../../../local-chart/local-chart'
import { addTimeRangePadding } from '../../../util-chart/add-time-range-padding'
import { processMetricsData } from '../../../util-chart/process-metrics-data'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

// NGINX: Query for nginx metrics (to remove when migrating to envoy)
const query = (ingressName: string) => `
100 *
sum by (status) (
  nginx:req_rate:5m_by_status{ingress="${ingressName}", status=~"5.."}
)
/
ignoring(status) group_left
clamp_min(
  sum(
    nginx:req_rate:5m{ingress="${ingressName}"}
  ),
  1
) > 0
`

// ENVOY: Query for envoy metrics
const queryEnvoy = (httpRouteName: string) => `
100 *
sum by (envoy_response_code) (
  envoy_proxy:req_rate:5m_by_status{httproute_name="${httpRouteName}", envoy_response_code=~"5.."}
)
/
ignoring(envoy_response_code) group_left
clamp_min(
  sum(
    envoy_proxy:req_rate:5m{httproute_name="${httpRouteName}"}
  ),
  1
) > 0
`

export function InstanceHTTPErrorsChart({
  clusterId,
  serviceId,
  ingressName,
  httpRouteName,
}: {
  clusterId: string
  serviceId: string
  containerName: string
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
  const { data: metricsHttpStatusErrorRatio, isLoading: isLoadingHttpStatusErrorRatio } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: query(ingressName),
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'http_errors',
  })

  // ENVOY: Fetch envoy metrics
  const { data: metricsEnvoyHttpStatusErrorRatio, isLoading: isLoadingEnvoyHttpStatusErrorRatio } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryEnvoy(httpRouteName),
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'envoy_http_errors',
  })

  const chartData = useMemo(() => {
    // Check if we have data from either source
    if (!metricsHttpStatusErrorRatio?.data?.result && !metricsEnvoyHttpStatusErrorRatio?.data?.result) {
      return []
    }

    // Merge nginx and envoy metrics into a single timeSeriesMap
    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // NGINX: Process nginx HTTP status error ratio (to remove when migrating to envoy)
    if (metricsHttpStatusErrorRatio?.data?.result) {
      processMetricsData(
        metricsHttpStatusErrorRatio,
        timeSeriesMap,
        (_, index) => JSON.stringify({ ...metricsHttpStatusErrorRatio.data.result[index].metric, source: 'nginx' }),
        (value) => parseFloat(value),
        useLocalTime
      )
    }

    // ENVOY: Process envoy HTTP status error ratio
    if (metricsEnvoyHttpStatusErrorRatio?.data?.result) {
      processMetricsData(
        metricsEnvoyHttpStatusErrorRatio,
        timeSeriesMap,
        (_, index) =>
          JSON.stringify({ ...metricsEnvoyHttpStatusErrorRatio.data.result[index].metric, source: 'envoy' }),
        (value) => parseFloat(value),
        useLocalTime
      )
    }

    // Convert map to sorted array and add time range padding
    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)
    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metricsHttpStatusErrorRatio, metricsEnvoyHttpStatusErrorRatio, useLocalTime, startTimestamp, endTimestamp])

  const seriesNames = useMemo(() => {
    const names: string[] = []

    // NGINX: Extract nginx series names (to remove when migrating to envoy)
    if (metricsHttpStatusErrorRatio?.data?.result) {
      names.push(
        ...metricsHttpStatusErrorRatio.data.result.map((_: unknown, index: number) =>
          JSON.stringify({ ...metricsHttpStatusErrorRatio.data.result[index].metric, source: 'nginx' })
        )
      )
    }

    // ENVOY: Extract envoy series names
    if (metricsEnvoyHttpStatusErrorRatio?.data?.result) {
      names.push(
        ...metricsEnvoyHttpStatusErrorRatio.data.result.map((_: unknown, index: number) =>
          JSON.stringify({ ...metricsEnvoyHttpStatusErrorRatio.data.result[index].metric, source: 'envoy' })
        )
      )
    }

    return names
  }, [metricsHttpStatusErrorRatio, metricsEnvoyHttpStatusErrorRatio])

  const isLoading = useMemo(() => {
    const shouldWaitForEnvoy = !!httpRouteName
    return isLoadingHttpStatusErrorRatio || (shouldWaitForEnvoy && isLoadingEnvoyHttpStatusErrorRatio)
  }, [isLoadingHttpStatusErrorRatio, isLoadingEnvoyHttpStatusErrorRatio, httpRouteName])

  return (
    <LocalChart
      data={chartData || []}
      isLoading={isLoading}
      isEmpty={(chartData || []).length === 0}
      tooltipLabel="HTTP Error Rate"
      unit="%"
      serviceId={serviceId}
      isFullscreen
      handleResetLegend={legendSelectedKeys.size > 0 ? handleResetLegend : undefined}
    >
      {seriesNames.map((name) => (
        <Area
          key={name}
          dataKey={name}
          name={name}
          stackId="httpErrors"
          stroke={getColorByPod(name)}
          fill={getColorByPod(name)}
          fillOpacity={0.6}
          strokeWidth={2}
          isAnimationActive={false}
          connectNulls={true}
          hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has(name) ? true : false}
        />
      ))}
      {!isLoadingHttpStatusErrorRatio && chartData.length > 0 && (
        <Chart.Legend
          name="instance-http-errors"
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          onClick={onClick}
          content={(props) => (
            <Chart.LegendContent
              selectedKeys={legendSelectedKeys}
              formatter={(value) => {
                const { status } = JSON.parse(value)
                return `status: "${status}"` as string
              }}
              {...props}
            />
          )}
        />
      )}
    </LocalChart>
  )
}

export default InstanceHTTPErrorsChart
