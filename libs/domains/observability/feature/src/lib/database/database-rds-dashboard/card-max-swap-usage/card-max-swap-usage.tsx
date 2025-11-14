import { useInstantMetrics } from '../../../hooks/use-instant-metrics/use-instant-metrics'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { CardMetric } from '../card-metric/card-metric'

interface CardSwapUsageProps {
  clusterId: string
  dbInstance: string
}

const queryMaxSwapUsage = (timeRange: string, dbInstance: string) => `
 max_over_time(
  max by (dimension_DBInstanceIdentifier) (
    aws_rds_swap_usage_average{dimension_DBInstanceIdentifier="${dbInstance}"}
  )[${timeRange}:]
)
`

export function CardSwapUsage({ clusterId, dbInstance }: CardSwapUsageProps) {
  const { startTimestamp, endTimestamp, timeRange } = useDashboardContext()

  const { data: metrics, isLoading } = useInstantMetrics({
    clusterId,
    query: queryMaxSwapUsage(timeRange, dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'max_swap_usage',
  })

  const series = metrics?.data?.result?.[0]?.value as [number, string] | undefined
  const lastValueStr = series && series.length > 0 ? series[1] : undefined
  const numValue = lastValueStr !== undefined ? parseFloat(lastValueStr) : undefined
  const isValid = Number.isFinite(numValue as number)

  const kbValue = isValid ? (numValue as number) / 1024 : undefined
  const formattedValue = kbValue !== undefined ? kbValue.toFixed(0) : '--'

  let status: 'GREEN' | 'YELLOW' | 'RED' | undefined
  if (isValid) {
    if ((kbValue as number) < 65536) {
      // < 64 MiB
      status = 'GREEN'
    } else if ((kbValue as number) < 524288) {
      // 64–512 MiB
      status = 'YELLOW'
    } else {
      status = 'RED' // > 512 MiB
    }
  }

  return (
    <CardMetric
      title="Swap Usage"
      value={formattedValue}
      unit="KiB"
      valueDescription="Max Swap Usage"
      description="Maximum swap usage on the database instance's disk."
      status={status}
      statusDescription="High swap usage typically means the instance has exhausted most of its available memory and has started moving data from RAM to disk."
      isLoading={isLoading}
    />
  )
}

export default CardSwapUsage
