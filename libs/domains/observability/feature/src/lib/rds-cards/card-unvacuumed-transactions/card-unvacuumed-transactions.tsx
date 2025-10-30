import { useRdsInstantMetrics } from '../../rds-managed-db/hooks/use-rds-instant-metrics/use-rds-instant-metrics'
import { useRdsManagedDbContext } from '../../rds-managed-db/util-filter/rds-managed-db-context'
import { CardRdsMetric } from '../card-rds-metric/card-rds-metric'

interface CardUnvacuumedTransactionsProps {
  clusterId: string
  dbInstance: string
}

const queryUnvacuumedTransactions = (dbInstance: string) => `
  max by (dimension_DBInstanceIdentifier) (
    aws_rds_maximum_used_transaction_ids_average{dimension_DBInstanceIdentifier="${dbInstance}"}
  )
`

export function CardUnvacuumedTransactions({ clusterId, dbInstance }: CardUnvacuumedTransactionsProps) {
  const { startTimestamp, endTimestamp, timeRange } = useRdsManagedDbContext()

  const { data: metrics, isLoading } = useRdsInstantMetrics({
    clusterId,
    query: queryUnvacuumedTransactions(dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'card_unvacuumed_transactions',
  })

  // Extract the value from metrics response
  const value = metrics?.data?.result?.[0]?.value?.[1]
  const formattedValue = value ? Math.round(parseFloat(value)).toLocaleString() : '--'

  console.log('PGPGP ', metrics)

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
      title="Unvacuumed Transactions"
      value={formattedValue}
      description="pending vacuum operations"
      status={status}
      isLoading={isLoading}
      icon="database"
    />
  )
}

export default CardUnvacuumedTransactions
