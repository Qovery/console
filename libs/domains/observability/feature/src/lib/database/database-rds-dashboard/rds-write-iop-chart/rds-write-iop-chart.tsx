import { useMemo } from 'react'
import { Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { useInstantMetrics } from '../../../hooks/use-instant-metrics/use-instant-metrics'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../../../local-chart/local-chart'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

const queryWriteIops = (dbInstance: string) => `
  max by (dimension_DBInstanceIdentifier) (
    aws_rds_write_iops_average{
      dimension_DBInstanceIdentifier="${dbInstance}"
    }
  )
`

const queryAverageWriteIops = (timeRange: string, dbInstance: string) => `
  avg_over_time(
    max by (dimension_DBInstanceIdentifier) (
      aws_rds_write_iops_average{dimension_DBInstanceIdentifier="${dbInstance}"}
    )[${timeRange}:]
)
`

export function RdsWriteIopChart({
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
    query: queryWriteIops(dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'write_iops_chart',
  })

  const { data: metricsAvg, isLoading: isLoadingAvg } = useInstantMetrics({
    clusterId,
    query: queryAverageWriteIops(timeRange, dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'avg_write_iops_chart',
  })

  const isLoading = isLoadingMetric || isLoadingAvg

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
        'Write IOPS': parseFloat(value),
      }
    })
  }, [metrics, useLocalTime])

  const avgWriteIopMetrics = useMemo(() => {
    const value = metricsAvg?.data?.result?.[0]?.value as [number, string] | undefined
    if (!value?.[1]) return '--'

    const numValue = parseFloat(value[1])
    return Number.isFinite(numValue) ? numValue.toFixed(2) : '--'
  }, [metricsAvg])

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      label="Write IOPS"
      description={`Write IOPS over time (avg: ${avgWriteIopMetrics})`}
      tooltipLabel="Write IOPS"
      unit="ops"
      serviceId={serviceId}
    >
      <Line
        dataKey="Write IOPS"
        name="Write IOPS"
        type="linear"
        stroke="var(--color-brand-500)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      {!isLoading && chartData.length > 0 && (
        <Chart.Legend
          name="write IOPS"
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          content={(props) => <Chart.LegendContent {...props} />}
        />
      )}
    </LocalChart>
  )
}

export default RdsWriteIopChart
