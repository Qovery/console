import { useMemo } from 'react'
import { Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { useRdsMetrics } from '../../rds-managed-db/hooks/use-rds-metrics/use-rds-metrics'
import { useRdsManagedDbContext } from '../../rds-managed-db/util-filter/rds-managed-db-context'
import { RdsLocalChart } from '../rds-local-chart/rds-local-chart'

const queryCpuUtilization = (dbInstance: string) => `
  aws_rds_cpuutilization_average{dimension_DBInstanceIdentifier="${dbInstance}"}
`

export function RdsCpuChart({ clusterId, dbInstance }: { clusterId: string; dbInstance: string }) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useRdsManagedDbContext()

  const { data: metrics, isLoading } = useRdsMetrics({
    clusterId,
    query: queryCpuUtilization(dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'cpu_chart',
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

      return {
        timestamp: timestampMs,
        time: timeStr,
        fullTime: useLocalTime ? date.toLocaleString() : date.toUTCString(),
        'CPU Utilization': parseFloat(value),
      }
    })
  }, [metrics, useLocalTime])

  return (
    <RdsLocalChart
      data={chartData}
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      label="CPU Utilization (%)"
      description="Average CPU usage over time"
      tooltipLabel="CPU"
      unit="%"
    >
      <Line
        dataKey="CPU Utilization"
        name="CPU Utilization"
        type="linear"
        stroke="var(--color-brand-500)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      {!isLoading && chartData.length > 0 && <Chart.Legend name="cpu" className="w-[calc(100%-0.5rem)] pb-1 pt-2" />}
    </RdsLocalChart>
  )
}

export default RdsCpuChart
