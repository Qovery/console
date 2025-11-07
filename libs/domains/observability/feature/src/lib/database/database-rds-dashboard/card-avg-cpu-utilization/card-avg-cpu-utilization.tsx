import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { CardRdsMetric } from '../card-rds-metric/card-rds-metric'

interface CardAvgCpuUtilizationProps {
  clusterId: string
  dbInstance: string
}

const queryAvgCpuUtilization = (timeRange: string, dbInstance: string) => `
avg_over_time  (aws_rds_cpuutilization_average{dimension_DBInstanceIdentifier="${dbInstance}"}[${timeRange}])
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

  // Extract the value from metrics response
  const value = metrics?.data?.result?.[0]?.values?.[0][1]
  const formattedValue = value ? parseFloat(value).toFixed(1) : '--'

  // Determine status based on value (CPU thresholds)
  let status: 'GREEN' | 'YELLOW' | 'RED' | undefined
  if (value !== undefined) {
    const numValue = parseFloat(value)
    if (numValue < 70) {
      status = 'GREEN'
    } else if (numValue < 85) {
      status = 'YELLOW'
    } else {
      status = 'RED'
    }
  }

  return (
    <CardRdsMetric
      title="avg CPU Utilization"
      value={formattedValue}
      unit="%"
      description="average CPU usage"
      status={status}
      isLoading={isLoading}
      icon="microchip" // TODO why?
    />
  )
}

export default CardAvgCpuUtilization
