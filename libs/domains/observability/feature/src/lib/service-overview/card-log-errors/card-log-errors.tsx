import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function CardLogErrors({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { startTimestamp, endTimestamp } = useServiceOverviewContext()
  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum (increase(promtail_custom_q_log_errors_total{qovery_com_service_id=~"${serviceId}"}[1h]))`,
    queryRange: 'query',
  })

  const value = metrics?.data?.result.length

  return (
    <CardMetric
      title="Log errors"
      value={value}
      status={value > 0 ? 'RED' : 'GREEN'}
      description="Errors during the last hour"
      isLoading={isLoadingMetrics}
    />
  )
}

export default CardLogErrors
