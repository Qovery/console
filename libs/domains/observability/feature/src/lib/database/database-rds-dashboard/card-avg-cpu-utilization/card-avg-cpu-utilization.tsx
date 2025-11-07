import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { CardMetric } from '../card-metric/card-metric'

interface CardAvgCpuUtilizationProps {
  clusterId: string
  dbInstance: string
}

const queryAvgCpuUtilization = (timeRange: string, dbInstance: string) => `
  avg_over_time(
    aws_rds_cpuutilization_average{dimension_DBInstanceIdentifier="${dbInstance}"}[${timeRange}]
  )
`

export function CardAvgCpuUtilization({ clusterId, dbInstance }: CardAvgCpuUtilizationProps) {
  const { startTimestamp, endTimestamp, timeRange } = useDashboardContext()

  const { data: metrics, isLoading } = useMetrics({
    clusterId,
    query: queryAvgCpuUtilization(timeRange, dbInstance),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'rds_overview',
    metricShortName: 'avg_cpu_utilization',
  })

  const series = metrics?.data?.result?.[0]?.values as [number, string][] | undefined
  const lastValueStr = series && series.length > 0 ? series[series.length - 1][1] : undefined
  const numValue = lastValueStr !== undefined ? parseFloat(lastValueStr) : undefined
  const isValid = Number.isFinite(numValue as number)

  const formattedValue = isValid ? (numValue as number).toFixed(1) : '--'

  let status: 'GREEN' | 'YELLOW' | 'RED' | undefined
  if (isValid) {
    if ((numValue as number) < 70) {
      status = 'GREEN'
    } else if ((numValue as number) < 85) {
      status = 'YELLOW'
    } else {
      status = 'RED'
    }
  }

  return (
    <CardMetric
      title="CPU Utilization"
      value={formattedValue}
      unit="%"
      valueDescription="avg CPU usage"
      description="Average CPU utilization over the selected time range."
      status={status}
      statusDescription="Higher averages may indicate increased workload or CPU saturation."
      isLoading={isLoading}
    />
  )
}

export default CardAvgCpuUtilization
