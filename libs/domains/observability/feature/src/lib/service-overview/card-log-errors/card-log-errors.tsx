import { useLocation, useNavigate } from 'react-router-dom'
import { ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { pluralize } from '@qovery/shared/util-js'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const query = (serviceId: string, timeRange: string) =>
  `sum (increase(promtail_custom_q_log_errors_total{qovery_com_service_id="${serviceId}"}[${timeRange}]))`

export function CardLogErrors({
  organizationId,
  projectId,
  environmentId,
  serviceId,
  clusterId,
}: {
  organizationId: string
  projectId: string
  environmentId: string
  serviceId: string
  clusterId: string
}) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { timeRange } = useServiceOverviewContext()
  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: query(serviceId, timeRange),
    queryRange: 'query',
    timeRange,
  })

  const value = metrics?.data?.result.length || 0

  const title = `${value} log ${pluralize(value, 'error', 'errors')}`
  const description = 'total log errors detected in the selected time range'

  return (
    <CardMetric
      title={title}
      description={description}
      isLoading={isLoadingMetrics}
      icon="scroll"
      onClick={() =>
        navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(serviceId), {
          state: { prevUrl: pathname },
        })
      }
    />
  )
}

export default CardLogErrors
