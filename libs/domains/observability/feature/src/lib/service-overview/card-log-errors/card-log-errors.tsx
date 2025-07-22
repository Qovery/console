import { useLocation, useNavigate } from 'react-router-dom'
import { ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { pluralize } from '@qovery/shared/util-js'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

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
