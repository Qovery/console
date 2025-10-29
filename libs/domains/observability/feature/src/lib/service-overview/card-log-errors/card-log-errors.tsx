import { useLocation, useNavigate } from 'react-router-dom'
import { ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { pluralize } from '@qovery/shared/util-js'
import { useInstantMetrics } from '../../hooks/use-instant-metrics/use-instant-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryToPrometheus = (serviceId: string, timeRange: string) =>
  `sum(increase(promtail_custom_q_log_errors_total{qovery_com_service_id="${serviceId}"}[${timeRange}]) or vector(0))`

const queryToLoki = (serviceId: string, timeRange: string) =>
  `sum(count_over_time({qovery_com_service_id="${serviceId}", level="error"} [${timeRange}]))`

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

  const timeRangeInHours = (parseInt(endTimestamp, 10) - parseInt(startTimestamp, 10)) / 3600
  // Call Loki to count real error number for time rage less than 2d (for precision vs query performance)
  const usePrometheus = timeRangeInHours > 48

  const { data: metricsPrometheus, isLoading: isLoadingMetricsPrometheus } = useInstantMetrics({
    clusterId,
    query: queryToPrometheus(serviceId, queryTimeRange),
    startTimestamp,
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_log_error_number',
    enabled: usePrometheus,
  })

  const { data: metricsLoki, isLoading: isLoadingMetricsLoki } = useInstantMetrics({
    clusterId,
    query: queryToLoki(serviceId, queryTimeRange),
    endpoint: 'loki',
    startTimestamp,
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_log_error_number',
    enabled: !usePrometheus,
  })

  const valueLoki = Math.ceil(metricsLoki?.data?.result?.[0]?.value?.[1]) || 0

  const startDate = new Date(parseInt(startTimestamp, 10) * 1000).toISOString()
  const endDate = new Date(parseInt(endTimestamp, 10) * 1000).toISOString()

  const value = usePrometheus ? Math.ceil(metricsPrometheus?.data?.result?.[0]?.value?.[1]) || 0 : valueLoki

  const title = `${value} log ${pluralize(value, 'error', 'errors')}`
  const description = 'total log errors detected in the selected time range'

  const isLoading = usePrometheus ? isLoadingMetricsPrometheus : isLoadingMetricsLoki

  return (
    <CardMetric
      title={title}
      description={description}
      isLoading={isLoading}
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
