import { useRdsInstantMetrics } from '../../rds-managed-db/hooks/use-rds-instant-metrics/use-rds-instant-metrics'
import { useRdsManagedDbContext } from '../../rds-managed-db/util-filter/rds-managed-db-context'
import { formatNumberShort } from '../../rds-managed-db/util/format-number-short'
import { CardRdsMetric } from '../card-rds-metric/card-rds-metric'

interface CardUnvacuumedTransactionsProps {
  clusterId: string
  dbInstance: string
}

const queryUnvacuumedTransactions = (timeRange: string, dbInstance: string) => `
 max_over_time(
  aws_rds_maximum_used_transaction_ids_average{dimension_DBInstanceIdentifier="${dbInstance}"}[${timeRange}]
)
`

export function CardUnvacuumedTransactions({ clusterId, dbInstance }: CardUnvacuumedTransactionsProps) {
  const { startTimestamp, endTimestamp, timeRange } = useRdsManagedDbContext()

  const { data: metrics, isLoading } = useRdsInstantMetrics({
    clusterId,
    query: queryUnvacuumedTransactions(timeRange, dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'card_unvacuumed_transactions',
  })

  // Extract the value from metrics response
  const value = metrics?.data?.result?.[0]?.value?.[1]
  const formattedValue = value ? formatNumberShort(Math.round(parseFloat(value))) : '--'

  // Determine status based on value (example thresholds)
  let status: 'GREEN' | 'YELLOW' | 'RED' | undefined
  if (value !== undefined) {
    const numValue = parseFloat(value)
    if (numValue < 1_000_000_000) {
      status = 'GREEN'
    } else if (numValue < 1_500_000_000) {
      status = 'YELLOW'
    } else {
      status = 'RED'
    }
  }

  return (
    <CardRdsMetric
      title="Unvacuumed Transactions (highest avg)"
      value={formattedValue}
      description="Backlog of database transactions needing cleanup. PostgreSQL can handle max 2 billion"
      status={status}
      isLoading={isLoading}
      icon="database" // TODO PG: don't know why
    />
  )
}

export default CardUnvacuumedTransactions
