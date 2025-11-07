import { useMemo } from 'react'
import { Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import LocalChart from '../../../local-chart/local-chart'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

const queryFreeableMemory = (dbInstance: string) => `
  aws_rds_freeable_memory_average{dimension_DBInstanceIdentifier="${dbInstance}"}
`

export function RdsRamChart({
  serviceId,
  clusterId,
  dbInstance,
}: {
  serviceId: string
  clusterId: string
  dbInstance: string
}) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useDashboardContext()

  const { data: metrics, isLoading } = useMetrics({
    clusterId,
    query: queryFreeableMemory(dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'ram_chart',
  })

  const chartData = useMemo(() => {
    if (!metrics?.data?.result?.[0]?.values) {
      return []
    }

    const values = metrics.data.result[0].values

    return values.map(([timestamp, value]: [number, string]) => {
      const timestampMs = timestamp * 1000 // Convert seconds to milliseconds
      const date = new Date(timestampMs)
      const timeStr = useLocalTime ? date.toLocaleTimeString() : date.toUTCString().split(' ')[4] // HH:MM:SS in UTC

      // Convert bytes to GB
      const gbValue = parseFloat(value) / (1024 * 1024 * 1024)

      return {
        timestamp: timestampMs,
        time: timeStr,
        fullTime: useLocalTime ? date.toLocaleString() : date.toUTCString(),
        'Available RAM': parseFloat(gbValue.toFixed(2)),
      }
    })
  }, [metrics, useLocalTime])

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      label="Available RAM (GB)"
      description="Free memory available over time"
      tooltipLabel="RAM"
      unit="GB"
      serviceId={serviceId}
    >
      <Line
        dataKey="Available RAM"
        name="Available RAM"
        type="linear"
        stroke="var(--color-green-500)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      {!isLoading && chartData.length > 0 && (
        <Chart.Legend
          name="ram"
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          content={(props) => <Chart.LegendContent {...props} />}
        />
      )}
    </LocalChart>
  )
}

export default RdsRamChart
