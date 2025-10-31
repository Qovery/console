import { useMemo } from 'react'
import { Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { useRdsMetrics } from '../../rds-managed-db/hooks/use-rds-metrics/use-rds-metrics'
import { useRdsManagedDbContext } from '../../rds-managed-db/util-filter/rds-managed-db-context'
import { RdsLocalChart } from '../rds-local-chart/rds-local-chart'

const queryFreeableMemory = (dbInstance: string) => `
  aws_rds_freeable_memory_average{dimension_DBInstanceIdentifier="${dbInstance}"}
`

export function RdsRamChart({ clusterId, dbInstance }: { clusterId: string; dbInstance: string }) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useRdsManagedDbContext()

  const { data: metrics, isLoading } = useRdsMetrics({
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
    <RdsLocalChart
      data={chartData}
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      label="Available RAM (GB)"
      description="Free memory available over time"
      tooltipLabel="RAM"
      unit="GB"
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
      {!isLoading && chartData.length > 0 && <Chart.Legend name="ram" className="w-[calc(100%-0.5rem)] pb-1 pt-2" />}
    </RdsLocalChart>
  )
}

export default RdsRamChart
