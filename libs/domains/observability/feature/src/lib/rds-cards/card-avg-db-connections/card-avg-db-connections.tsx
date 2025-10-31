import { useRdsInstantMetrics } from '../../rds-managed-db/hooks/use-rds-instant-metrics/use-rds-instant-metrics'
import { useRdsManagedDbContext } from '../../rds-managed-db/util-filter/rds-managed-db-context'
import { CardRdsMetric } from '../card-rds-metric/card-rds-metric'

interface CardAvgDbConnectionsProps {
  clusterId: string
  dbInstance: string
}

const queryAvgDbConnections = (timeRange: string, dbInstance: string) => `
avg_over_time(aws_rds_database_connections_average{dimension_DBInstanceIdentifier="${dbInstance}"}[${timeRange}])
`

export function CardAvgDbConnections({ clusterId, dbInstance }: CardAvgDbConnectionsProps) {
  const { startTimestamp, endTimestamp, timeRange } = useRdsManagedDbContext()

  const { data: metrics, isLoading } = useRdsInstantMetrics({
    clusterId,
    query: queryAvgDbConnections(timeRange, dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'avg_db_connections',
  })

  // Extract the value from metrics response
  const value = metrics?.data?.result?.[0]?.value?.[1]
  const formattedValue = value ? Math.round(parseFloat(value)).toLocaleString() : '--'

  // Determine status based on value (connections thresholds)
  let status: 'GREEN' | 'YELLOW' | 'RED' | undefined
  if (value !== undefined) {
    const numValue = parseFloat(value)
    if (numValue < 80) {
      status = 'GREEN'
    } else if (numValue < 150) {
      status = 'YELLOW'
    } else {
      status = 'RED'
    }
  }

  return (
    <CardRdsMetric
      title="avg Database Connections"
      value={formattedValue}
      description="average active connections"
      status={status}
      isLoading={isLoading}
      icon="link"
    />
  )
}

export default CardAvgDbConnections
