import { CardRdsMetric } from '../card-rds-metric/card-rds-metric'

interface CardAvgCpuUtilizationProps {
  clusterId: string
  dbInstance: string
}

export function CardAvgCpuUtilization({ clusterId, dbInstance }: CardAvgCpuUtilizationProps) {
  // TODO: Implement real metrics query
  // const { data: metrics, isLoading } = useRdsMetrics({
  //   clusterId,
  //   dbInstance,
  //   metricType: 'avg_cpu_utilization'
  // })

  // Placeholder values
  const isLoading = false
  const value = '--'
  const status = undefined

  return (
    <CardRdsMetric
      title="avg CPU Utilization"
      value={value}
      unit="%"
      description="average CPU usage"
      status={status}
      isLoading={isLoading}
      icon="microchip"
    />
  )
}

export default CardAvgCpuUtilization
