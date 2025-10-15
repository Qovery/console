import { useLocation, useNavigate } from 'react-router-dom'
import { ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { pluralize } from '@qovery/shared/util-js'
import { useInstantMetrics } from '../../hooks/use-instant-metrics/use-instant-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const query = (serviceId: string, timeRange: string) =>
  `sum(increase(promtail_custom_q_log_errors_total{qovery_com_service_id="${serviceId}"}[${timeRange}]) or vector(0))`

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
  containerName: string
}) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { queryTimeRange, startTimestamp, endTimestamp } = useServiceOverviewContext()
  const { data: metrics, isLoading: isLoadingMetrics } = useInstantMetrics({
    clusterId,
    query: query(serviceId, queryTimeRange),
    startTimestamp,
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_log_error_number',
  })

  const startDate = new Date(parseInt(startTimestamp, 10) * 1000).toISOString()
  const endDate = new Date(parseInt(endTimestamp, 10) * 1000).toISOString()

  const value = Math.ceil(metrics?.data?.result?.[0]?.value?.[1]) || 0

  const title = `${value} log ${pluralize(value, 'error', 'errors')}`
  const description = 'total log errors detected in the selected time range'

  return (
    <CardMetric
      title={title}
      description={description}
      isLoading={isLoadingMetrics}
      icon="scroll"
      onClick={() =>
        navigate(
          ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
            SERVICE_LOGS_URL(serviceId, undefined, startDate, endDate, 'error'),
          {
            state: { prevUrl: pathname },
          }
        )
      }
    />
  )
}

export default CardLogErrors
