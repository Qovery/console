import { useInstantMetrics } from '../../../hooks/use-instant-metrics/use-instant-metrics'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { CardMetric } from '../card-metric/card-metric'

interface CardAvgDbConnectionsProps {
  clusterId: string
  dbInstance: string
}

const queryAvgDbConnections = (timeRange: string, dbInstance: string) => `
  avg_over_time(
    max by (dimension_DBInstanceIdentifier) (
      aws_rds_database_connections_average{dimension_DBInstanceIdentifier="${dbInstance}"}
    )[${timeRange}:]
  )
`

export function CardAvgDbConnections({ clusterId, dbInstance }: CardAvgDbConnectionsProps) {
  const { startTimestamp, endTimestamp, timeRange } = useDashboardContext()

  const { data: metrics, isLoading } = useInstantMetrics({
    clusterId,
    query: queryAvgDbConnections(timeRange, dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'avg_db_connections',
  })

  const series = metrics?.data?.result?.[0]?.value as [number, string] | undefined
  const lastValueStr = series && series.length > 0 ? series[1] : undefined
  const numValue = lastValueStr !== undefined ? parseFloat(lastValueStr) : undefined
  const isValid = Number.isFinite(numValue as number)

  const formattedValue = isValid
    ? (numValue as number).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '--'

  let status: 'GREEN' | 'YELLOW' | 'RED' | undefined
  if (isValid) {
    if ((numValue as number) < 80) {
      status = 'GREEN'
    } else if ((numValue as number) < 150) {
      status = 'YELLOW'
    } else {
      status = 'RED'
    }
  }

  return (
    <CardMetric
      title="Database Connections"
      value={formattedValue}
      valueDescription="avg active connections"
      description="Average number of active database connections over the selected time range."
      status={status}
      statusDescription="Higher averages can indicate rising load or connection saturation."
      isLoading={isLoading}
    />
  )
}

export default CardAvgDbConnections
