import { useMemo } from 'react'
import { Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { useInstantMetrics } from '../../../hooks/use-instant-metrics/use-instant-metrics'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../../../local-chart/local-chart'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

const queryReadLatency = (dbInstance: string) => `
  max by (dimension_DBInstanceIdentifier) (
    aws_rds_read_latency_average{
      dimension_DBInstanceIdentifier="${dbInstance}"
    }
  )
`

const queryMaxReadLatency = (timeRange: string, dbInstance: string) => `
 max_over_time(
    max by (dimension_DBInstanceIdentifier) (
      aws_rds_read_latency_average{dimension_DBInstanceIdentifier="${dbInstance}"}
    )[${timeRange}:]
)
`

export function RdsReadLatencyChart({
  serviceId,
  clusterId,
  dbInstance,
}: {
  serviceId: string
  clusterId: string
  dbInstance: string
}) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useDashboardContext()

  const { data: metrics, isLoading: isLoadingMetric } = useMetrics({
    clusterId,
    query: queryReadLatency(dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'read_latency_chart',
  })

  const { data: maxMetrics, isLoading: isLoadingMax } = useInstantMetrics({
    clusterId,
    query: queryMaxReadLatency(timeRange, dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'read_max_latency_chart',
  })

  const isLoading = isLoadingMetric || isLoadingMax

  const chartData = useMemo(() => {
    if (!metrics?.data?.result?.[0]?.values) {
      return []
    }

    const values = metrics.data.result[0].values

    return values.map(([timestamp, value]: [number, string]) => {
      const timestampMs = timestamp * 1000 // Convert seconds to milliseconds
      const date = new Date(timestampMs)
      const timeStr = useLocalTime ? date.toLocaleTimeString() : date.toUTCString().split(' ')[4] // HH:MM:SS in UTC

      return {
        timestamp: timestampMs,
        time: timeStr,
        fullTime: useLocalTime ? date.toLocaleString() : date.toUTCString(),
        'Read Latency': parseFloat(value) * 1000,
      }
    })
  }, [metrics, useLocalTime])

  const maxReadLatencyMetrics = useMemo(() => {
    const value = maxMetrics?.data?.result?.[0]?.value as [number, string] | undefined
    if (!value?.[1]) return '--'

    const numValue = parseFloat(value[1]) * 1000 // Convert seconds to milliseconds
    return Number.isFinite(numValue) ? numValue.toFixed(2) : '--'
  }, [maxMetrics])

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      label="Read Latency"
      description="Read latency over time"
      descriptionRight={
        <>
          Maximum: <span className="font-medium">{maxReadLatencyMetrics} ms</span>
        </>
      }
      tooltipLabel="Read Latency"
      unit="ms"
      serviceId={serviceId}
    >
      <Line
        dataKey="Read Latency"
        name="Read Latency"
        type="linear"
        stroke="var(--color-brand-500)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      {!isLoading && chartData.length > 0 && (
        <Chart.Legend
          name="read latency"
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          content={(props) => <Chart.LegendContent {...props} />}
        />
      )}
    </LocalChart>
  )
}

export default RdsReadLatencyChart
