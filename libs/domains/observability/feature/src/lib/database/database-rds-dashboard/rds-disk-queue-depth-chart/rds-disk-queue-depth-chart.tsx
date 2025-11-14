import { useMemo } from 'react'
import { Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { useInstantMetrics } from '../../../hooks/use-instant-metrics/use-instant-metrics'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import LocalChart from '../../../local-chart/local-chart'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

const queryDiskQueueDepth = (dbInstance: string) => `
  max by(dimension_DBInstanceIdentifier) (aws_rds_disk_queue_depth_average{dimension_DBInstanceIdentifier="${dbInstance}"})
`

const queryDiskQueueDepthAvg = (timeRange: string, dbInstance: string) => `
  avg_over_time (aws_rds_disk_queue_depth_average{dimension_DBInstanceIdentifier="${dbInstance}"}[${timeRange}])
`

export function RdsDiskQueueDepthChart({
  serviceId,
  clusterId,
  dbInstance,
}: {
  serviceId: string
  clusterId: string
  dbInstance: string
}) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useDashboardContext()

  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: queryDiskQueueDepth(dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'disk_queue_depth_chart',
  })

  const { data: metricsAvg, isLoading: isLoadingAvg } = useInstantMetrics({
    clusterId,
    query: queryDiskQueueDepthAvg(timeRange, dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'avg_disk_queue_depth_chart',
  })

  const isLoading = isLoadingMetrics || isLoadingAvg

  const diskQueueDepthAvg = useMemo(() => {
    const value = metricsAvg?.data?.result?.[0]?.value as [number, string] | undefined
    if (!value?.[1]) return '--'

    const numValue = parseFloat(value[1])
    return Number.isFinite(numValue) ? numValue.toFixed(2) : '--'
  }, [metricsAvg])

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
        'Disk Queue Depth': parseFloat(value),
      }
    })
  }, [metrics, useLocalTime])

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoading || isLoadingAvg}
      isEmpty={chartData.length === 0}
      label="Disk Queue Depth"
      description="Outstanding disk I/O operations"
      descriptionRight={
        <>
          Average: <span className="font-medium">{diskQueueDepthAvg} reqs</span>
        </>
      }
      tooltipLabel="Disk Queue"
      unit="requests"
      serviceId={serviceId}
    >
      <Line
        dataKey="Disk Queue Depth"
        name="Disk Queue Depth"
        type="linear"
        stroke="var(--color-purple-500)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      {!isLoading && chartData.length > 0 && (
        <Chart.Legend
          name="disk-queue"
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          content={(props) => <Chart.LegendContent {...props} />}
        />
      )}
    </LocalChart>
  )
}

export default RdsDiskQueueDepthChart
