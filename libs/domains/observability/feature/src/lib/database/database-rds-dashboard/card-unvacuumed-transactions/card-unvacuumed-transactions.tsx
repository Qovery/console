import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { CardRdsMetric } from '../card-rds-metric/card-rds-metric'
import { formatNumberShort } from '../util/format-number-short'

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
  const { startTimestamp, endTimestamp, timeRange } = useDashboardContext()

  const { data: metrics, isLoading } = useMetrics({
    clusterId,
    query: queryUnvacuumedTransactions(timeRange, dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'card_unvacuumed_transactions',
  })

  console.log('metrics', metrics)

  // Extract the value from metrics response
  const value = metrics?.data?.result?.[0]?.values?.[0][1]
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
