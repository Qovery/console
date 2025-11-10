import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { CardMetric } from '../card-metric/card-metric'
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

  const series = metrics?.data?.result?.[0]?.values as [number, string][] | undefined
  const lastValueStr = series && series.length > 0 ? series[series.length - 1][1] : undefined
  const numValue = lastValueStr !== undefined ? parseFloat(lastValueStr) : undefined
  const isValid = Number.isFinite(numValue as number)

  const formattedValue = isValid ? formatNumberShort(Math.round(numValue as number)) : '--'

  // Status thresholds based on AWS guidance:
  // - GREEN: normal levels
  // - YELLOW: early warning around hundreds of millions
  // - RED: critical when approaching one billion
  let status: 'GREEN' | 'YELLOW' | 'RED' | undefined
  if (isValid) {
    if ((numValue as number) < 500_000_000) {
      status = 'GREEN'
    } else if ((numValue as number) < 1_000_000_000) {
      status = 'YELLOW'
    } else {
      status = 'RED'
    }
  }

  return (
    <CardMetric
      title="Unvacuumed Transactions"
      value={formattedValue}
      valueDescription="pending cleanup operations"
      description={
        <>
          Shows the backlog of PostgreSQL transactions awaiting VACUUM cleanup. <br />
          Small to moderate levels are expected during normal operation.
        </>
      }
      status={status}
      statusDescription={
        <>
          Shows how many PostgreSQL transactions are still waiting for VACUUM cleanup. <br />
          Real risk only appears when values reach hundreds of millions to billions.
        </>
      }
      isLoading={isLoading}
    />
  )
}

export default CardUnvacuumedTransactions
