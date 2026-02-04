import { useState } from 'react'
import { pluralize } from '@qovery/shared/util-js'
import { useInstantMetrics } from '../../../hooks/use-instant-metrics/use-instant-metrics'
import { ModalChart } from '../../../modal-chart/modal-chart'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { CardMetric } from '../card-metric/card-metric'
import { InstanceHTTPErrorsChart } from '../instance-http-errors-chart/instance-http-errors-chart'

// NGINX: Queries for nginx metrics (to remove when migrating to envoy)
const queryErrorRequest = (timeRange: string, ingressName: string) => `
   sum(sum_over_time(
    (nginx:req_inc:5m_by_status{ingress="${ingressName}", status=~"5.."})[${timeRange}:5m]
  ))
`

const queryTotalRequest = (timeRange: string, ingressName: string) => `
  sum_over_time(
    (nginx:req_inc:5m{ingress="${ingressName}"})[${timeRange}:5m]
  )
`

// ENVOY: Queries for envoy metrics
const queryEnvoyErrorRequest = (timeRange: string, httpRouteName: string) => `
  sum(sum_over_time(
    (envoy_proxy:req_inc:5m_by_status{httproute_name="${httpRouteName}", envoy_response_code=~"5.."})[${timeRange}:5m]
  ))
`

const queryEnvoyTotalRequest = (timeRange: string, httpRouteName: string) => `
  sum_over_time(
    (envoy_proxy:req_inc:5m{httproute_name="${httpRouteName}"})[${timeRange}:5m]
  )
`

export function CardHTTPErrors({
  serviceId,
  clusterId,
  containerName,
  ingressName,
  httpRouteName,
}: {
  serviceId: string
  clusterId: string
  containerName: string
  ingressName: string
  httpRouteName: string
}) {
  const { queryTimeRange, startTimestamp, endTimestamp } = useDashboardContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // NGINX: Fetch nginx metrics (to remove when migrating to envoy)
  const { data: metricsErrorRequest, isLoading: isLoadingMetrics } = useInstantMetrics({
    clusterId,
    query: queryErrorRequest(queryTimeRange, ingressName),
    startTimestamp,
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_req_errors_number',
  })

  const { data: metricsTotalRequest, isLoading: isLoadingMetricsTotalRequest } = useInstantMetrics({
    clusterId,
    query: queryTotalRequest(queryTimeRange, ingressName),
    startTimestamp,
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_req_all_number',
  })

  // ENVOY: Fetch envoy metrics (only if httpRouteName is configured)
  const { data: metricsEnvoyErrorRequest, isLoading: isLoadingMetricsEnvoyError } = useInstantMetrics({
    clusterId,
    query: queryEnvoyErrorRequest(queryTimeRange, httpRouteName),
    startTimestamp,
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_envoy_req_errors_number',
    enabled: !!httpRouteName,
  })

  const { data: metricsEnvoyTotalRequest, isLoading: isLoadingMetricsEnvoyTotal } = useInstantMetrics({
    clusterId,
    query: queryEnvoyTotalRequest(queryTimeRange, httpRouteName),
    startTimestamp,
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_envoy_req_all_number',
    enabled: !!httpRouteName,
  })

  // Aggregate nginx + envoy metrics
  const nginxErrors = Math.round(metricsErrorRequest?.data?.result[0]?.value[1]) || 0
  const nginxTotal = Math.round(metricsTotalRequest?.data?.result[0]?.value[1]) || 0
  const envoyErrors = Math.round(metricsEnvoyErrorRequest?.data?.result[0]?.value[1]) || 0
  const envoyTotal = Math.round(metricsEnvoyTotalRequest?.data?.result[0]?.value[1]) || 0

  const errorRaw = nginxErrors + envoyErrors
  const totalRequest = nginxTotal + envoyTotal
  const errorRate = Math.ceil(totalRequest > 0 ? 100 * (errorRaw / totalRequest) : 0) || 0
  const isError = errorRate > 0

  const title = `${errorRate}% HTTP error rate`
  const description = `on ${totalRequest} ${pluralize(totalRequest, 'request', 'requests')}`

  return (
    <>
      <CardMetric
        title={title}
        description={description}
        isLoading={
          isLoadingMetrics || isLoadingMetricsTotalRequest || isLoadingMetricsEnvoyError || isLoadingMetricsEnvoyTotal
        }
        onClick={isError ? () => setIsModalOpen(true) : undefined}
        hasModalLink={isError}
      />
      {isModalOpen && (
        <ModalChart
          title={title}
          description="Number of HTTP errors over time."
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        >
          <div className="grid h-full grid-cols-1">
            <InstanceHTTPErrorsChart
              clusterId={clusterId}
              serviceId={serviceId}
              containerName={containerName}
              ingressName={ingressName}
              httpRouteName={httpRouteName}
            />
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default CardHTTPErrors
