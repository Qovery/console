import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { CardRdsMetric } from '../card-rds-metric/card-rds-metric'

interface CardAvailableRamProps {
  clusterId: string
  dbInstance: string
}

const queryAvailableRam = (timeRange: string, dbInstance: string) => `
avg_over_time(aws_rds_freeable_memory_average{dimension_DBInstanceIdentifier="${dbInstance}"}[${timeRange}])
`

export function CardAvailableRam({ clusterId, dbInstance }: CardAvailableRamProps) {
  const { startTimestamp, endTimestamp, timeRange } = useDashboardContext()

  const { data: metrics, isLoading } = useMetrics({
    clusterId,
    query: queryAvailableRam(timeRange, dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'available_ram',
  })

  // Extract the value from metrics response (in bytes)
  const value = metrics?.data?.result?.[0]?.values?.[0][1]
  // Convert bytes to GB
  const gbValue = value ? parseFloat(value) / (1024 * 1024 * 1024) : undefined
  const formattedValue = gbValue !== undefined ? gbValue.toFixed(2) : '--'

  return (
    <CardRdsMetric
      title="Available RAM on Instances"
      value={formattedValue}
      unit="GB"
      description="free memory available"
      status={undefined}
      isLoading={isLoading}
      icon="memory"
    />
  )
}

export default CardAvailableRam
