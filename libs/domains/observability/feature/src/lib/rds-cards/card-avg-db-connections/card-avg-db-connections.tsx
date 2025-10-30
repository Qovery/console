import { CardRdsMetric } from '../card-rds-metric/card-rds-metric'

interface CardAvgDbConnectionsProps {
  clusterId: string
  dbInstance: string
}

export function CardAvgDbConnections({ clusterId, dbInstance }: CardAvgDbConnectionsProps) {
  // TODO: Implement real metrics query
  // const { data: metrics, isLoading } = useRdsMetrics({
  //   clusterId,
  //   dbInstance,
  //   metricType: 'avg_db_connections'
  // })

  // Placeholder values
  const isLoading = false
  const value = '--'
  const status = undefined

  return (
    <CardRdsMetric
      title="avg Database Connections"
      value={value}
      description="average active connections"
      status={status}
      isLoading={isLoading}
      icon="link"
    />
  )
}

export default CardAvgDbConnections
