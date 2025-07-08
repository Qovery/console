import { pluralize } from '@qovery/shared/util-js'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function CardLogErrors({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { timeRange } = useServiceOverviewContext()
  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: `sum (increase(promtail_custom_q_log_errors_total{qovery_com_service_id=~"${serviceId}"}[${timeRange}]))`,
    queryRange: 'query',
  })

  const value = metrics?.data?.result.length
  const isError = value > 0

  return (
    <CardMetric
      title={`Log ${pluralize(value, 'error', 'errors')} rate`}
      value={value}
      status={isError ? 'RED' : 'GREEN'}
      description={`in the last ${timeRange}`}
      isLoading={isLoadingMetrics}
    />
  )
}

export default CardLogErrors
