import { useInstantMetrics } from '../../../hooks/use-instant-metrics/use-instant-metrics'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { CardMetric } from '../card-metric/card-metric'

interface CardAvailableRamProps {
  clusterId: string
  dbInstance: string
}

const queryAvailableRam = (timeRange: string, dbInstance: string) => `
  avg_over_time(
    aws_rds_freeable_memory_average{dimension_DBInstanceIdentifier="${dbInstance}"}[${timeRange}]
  )
`

export function CardAvailableRam({ clusterId, dbInstance }: CardAvailableRamProps) {
  const { startTimestamp, endTimestamp, timeRange } = useDashboardContext()

  const { data: metrics, isLoading } = useInstantMetrics({
    clusterId,
    query: queryAvailableRam(timeRange, dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'available_ram',
  })

  const series = metrics?.data?.result?.[0]?.value as [number, string] | undefined
  const lastValueStr = series && series.length > 0 ? series[1] : undefined
  const numValue = lastValueStr !== undefined ? parseFloat(lastValueStr) : undefined
  const isValid = Number.isFinite(numValue as number)

  const gbValue = isValid ? (numValue as number) / (1024 * 1024 * 1024) : undefined
  const formattedValue = gbValue !== undefined ? gbValue.toFixed(2) : '--'

  return (
    <CardMetric
      title="Available RAM"
      value={formattedValue}
      unit="GB"
      valueDescription="Average free memory"
      description="Average free memory available over the selected time range."
      isLoading={isLoading}
    />
  )
}

export default CardAvailableRam
