import { useMemo } from 'react'
import { Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { useRdsMetrics } from '../../rds-managed-db/hooks/use-rds-metrics/use-rds-metrics'
import { useRdsManagedDbContext } from '../../rds-managed-db/util-filter/rds-managed-db-context'
import { RdsLocalChart } from '../rds-local-chart/rds-local-chart'

const queryDiskQueueDepth = (dbInstance: string) => `
  aws_rds_disk_queue_depth_average{dimension_DBInstanceIdentifier="${dbInstance}"}
`

export function RdsDiskQueueDepthChart({ clusterId, dbInstance }: { clusterId: string; dbInstance: string }) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useRdsManagedDbContext()

  const { data: metrics, isLoading } = useRdsMetrics({
    clusterId,
    query: queryDiskQueueDepth(dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'disk_queue_depth_chart',
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
        'Disk Queue Depth': parseFloat(value),
      }
    })
  }, [metrics, useLocalTime])

  return (
    <RdsLocalChart
      data={chartData}
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      label="Disk Queue Depth"
      description="Number of outstanding I/O operations waiting to access the disk"
      tooltipLabel="Disk Queue"
      unit="requests"
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
        <Chart.Legend name="disk-queue" className="w-[calc(100%-0.5rem)] pb-1 pt-2" />
      )}
    </RdsLocalChart>
  )
}

export default RdsDiskQueueDepthChart
