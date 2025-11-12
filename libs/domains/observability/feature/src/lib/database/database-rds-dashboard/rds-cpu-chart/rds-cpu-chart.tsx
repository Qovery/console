import { useMemo } from 'react'
import { Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../../../local-chart/local-chart'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

const queryCpuUtilization = (dbInstance: string) => `
  max by (dimension_DBInstanceIdentifier) (aws_rds_cpuutilization_average{dimension_DBInstanceIdentifier="${dbInstance}"})
`

export function RdsCpuChart({
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
    <LocalChart
      data={chartData}
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      label="CPU Utilization (%)"
      description="Average CPU usage over time"
      tooltipLabel="CPU"
      unit="%"
      serviceId={serviceId}
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
      {!isLoading && chartData.length > 0 && (
        <Chart.Legend
          name="cpu"
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          content={(props) => <Chart.LegendContent {...props} />}
        />
      )}
    </LocalChart>
  )
}

export default RdsCpuChart
