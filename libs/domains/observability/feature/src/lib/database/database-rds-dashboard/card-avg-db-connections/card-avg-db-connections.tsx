import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { CardMetric } from '../card-metric/card-metric'

interface CardAvgDbConnectionsProps {
  clusterId: string
  dbInstance: string
}

const queryAvgDbConnections = (timeRange: string, dbInstance: string) => `
  avg_over_time(
    aws_rds_database_connections_average{dimension_DBInstanceIdentifier="${dbInstance}"}[${timeRange}]
  )
`

export function CardAvgDbConnections({ clusterId, dbInstance }: CardAvgDbConnectionsProps) {
  const { startTimestamp, endTimestamp, timeRange } = useDashboardContext()

  const { data: metrics, isLoading } = useMetrics({
    clusterId,
    query: queryAvgDbConnections(timeRange, dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'avg_db_connections',
  })

  const series = metrics?.data?.result?.[0]?.values as [number, string][] | undefined
  const lastValueStr = series && series.length > 0 ? series[series.length - 1][1] : undefined
  const numValue = lastValueStr !== undefined ? parseFloat(lastValueStr) : undefined
  const isValid = Number.isFinite(numValue as number)

  const formattedValue = isValid ? Math.round(numValue as number).toLocaleString() : '--'

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
