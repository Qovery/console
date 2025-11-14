import { useMemo } from 'react'
import { Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { useInstantMetrics } from '../../../hooks/use-instant-metrics/use-instant-metrics'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../../../local-chart/local-chart'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

const queryFreeStorageSpace = (dbInstance: string) => `
  sum by (dimension_DBInstanceIdentifier) (
    aws_rds_free_storage_space_average{
      dimension_DBInstanceIdentifier="${dbInstance}"
    }
)
`

const queryAvgFreeStorageSpace = (timeRange: string, dbInstance: string) => `
  avg_over_time(
    max by (dimension_DBInstanceIdentifier) (
      aws_rds_free_storage_space_average{dimension_DBInstanceIdentifier="${dbInstance}"}
    )[${timeRange}:]
)
`

export function RdsStorageAvailableChart({
  serviceId,
  clusterId,
  dbInstance,
  storageResourceInGiB,
}: {
  serviceId: string
  clusterId: string
  dbInstance: string
  storageResourceInGiB?: number
}) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useDashboardContext()

  const { data: metrics, isLoading: isLoadingMetric } = useMetrics({
    clusterId,
    query: queryFreeStorageSpace(dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'avg_free_storage_space',
  })

  const { data: metricsAvg, isLoading: isLoadingAvg } = useInstantMetrics({
    clusterId,
    query: queryAvgFreeStorageSpace(timeRange, dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'free_storage_space',
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
        'Storage Available':
          storageResourceInGiB !== undefined
            ? (parseFloat(value) / (storageResourceInGiB * 1024 * 1024 * 1024)) * 100
            : 0,
      }
    })
  }, [metrics, storageResourceInGiB, useLocalTime])

  const avgFreeStorage = useMemo(() => {
    const value = metricsAvg?.data?.result?.[0]?.value as [number, string] | undefined
    if (!value?.[1] || !storageResourceInGiB) return '--'

    const numValue = (parseFloat(value[1]) / (storageResourceInGiB * 1024 * 1024 * 1024)) * 100
    return Number.isFinite(numValue) ? numValue.toFixed(2) : '--'
  }, [metricsAvg, storageResourceInGiB])

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      label="Storage Available"
      description={`Storage Available over time (avg: ${avgFreeStorage}%)`}
      tooltipLabel="% Storage Available"
      unit="%"
      serviceId={serviceId}
    >
      <Line
        dataKey="Storage Available"
        name="Storage Available"
        type="linear"
        stroke="var(--color-brand-500)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      {!isLoading && chartData.length > 0 && (
        <Chart.Legend
          name="Storage Available"
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          content={(props) => <Chart.LegendContent {...props} />}
        />
      )}
    </LocalChart>
  )
}

export default RdsStorageAvailableChart
