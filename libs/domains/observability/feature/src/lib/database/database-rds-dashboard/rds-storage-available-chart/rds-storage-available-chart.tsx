import { useMemo } from 'react'
import { Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { useInstantMetrics } from '../../../hooks/use-instant-metrics/use-instant-metrics'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../../../local-chart/local-chart'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { getStorageAvailable } from './get-storage-available'

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
  const storageCapacity =
    storageResourceInGiB !== undefined && storageResourceInGiB > 0 ? storageResourceInGiB : undefined
  const storageUnit = storageCapacity === undefined ? 'GiB' : '%'

  const chartData = useMemo(() => {
    if (!metrics?.data?.result?.[0]?.values) {
      return []
    }

    const values = metrics.data.result[0].values

    return values.flatMap(([timestamp, value]: [number, string]) => {
      const storageAvailable = getStorageAvailable(value, storageCapacity)
      if (storageAvailable === undefined) return []

      const timestampMs = timestamp * 1000 // Convert seconds to milliseconds
      const date = new Date(timestampMs)
      const timeStr = useLocalTime ? date.toLocaleTimeString() : date.toUTCString().split(' ')[4] // HH:MM:SS in UTC

      return [
        {
          timestamp: timestampMs,
          time: timeStr,
          fullTime: useLocalTime ? date.toLocaleString() : date.toUTCString(),
          'Storage Available': storageAvailable,
        },
      ]
    })
  }, [metrics, storageCapacity, useLocalTime])

  const avgFreeStorage = useMemo(() => {
    const value = metricsAvg?.data?.result?.[0]?.value as [number, string] | undefined
    if (!value?.[1]) return '--'

    const numValue = getStorageAvailable(value[1], storageCapacity)
    return numValue === undefined ? '--' : numValue.toFixed(2)
  }, [metricsAvg, storageCapacity])

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      label="Storage Available"
      description="Storage Available over time"
      descriptionRight={
        <>
          Average:{' '}
          <span className="font-medium">
            {avgFreeStorage}
            {storageUnit}
          </span>
        </>
      }
      tooltipLabel="Storage Available"
      unit={storageUnit}
      serviceId={serviceId}
    >
      <Line
        dataKey="Storage Available"
        name="Storage Available"
        type="linear"
        stroke="#5B50D6"
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
