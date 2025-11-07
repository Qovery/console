import { useState } from 'react'
import { pluralize } from '@qovery/shared/util-js'
import { useInstantMetrics } from '../../../hooks/use-instant-metrics/use-instant-metrics'
import { ModalChart } from '../../../modal-chart/modal-chart'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { CardMetric } from '../card-metric/card-metric'
import { PrivateInstanceHTTPErrorsChart } from '../instance-private-http-errors-chart/instance-private-http-errors-chart'

const queryErrorRequest = (containerName: string, timeRange: string) => `
      sum(sum_over_time(beyla:req_inc:5m_by_status{k8s_container_name="${containerName}", http_response_status_code=~"5.."}[${timeRange}:5m])
)
`

const queryTotalRequest = (containerName: string, timeRange: string) => `
    sum(sum_over_time(beyla:req_inc:5m_by_status{k8s_container_name="${containerName}"}[${timeRange}:5m])
`

export function CardPrivateHTTPErrors({
  serviceId,
  clusterId,
  containerName,
}: {
  serviceId: string
  clusterId: string
  containerName: string
}) {
  const { queryTimeRange, startTimestamp, endTimestamp } = useDashboardContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: metricsErrorRequest, isLoading: isLoadingMetrics } = useInstantMetrics({
    clusterId,
    query: queryErrorRequest(containerName, queryTimeRange),
    startTimestamp,
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_private_req_errors_number',
  })

  const { data: metricsTotalRequest, isLoading: isLoadingMetricsTotalRequest } = useInstantMetrics({
    clusterId,
    query: queryTotalRequest(containerName, queryTimeRange),
    startTimestamp,
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_private_req_all_number',
  })

  const errorRaw = Math.round(metricsErrorRequest?.data?.result[0]?.value[1])
  const totalRequest = Math.round(metricsTotalRequest?.data?.result[0]?.value[1]) || 0
  const errorRate = Math.ceil(totalRequest > 0 ? 100 * (errorRaw / totalRequest) : 0) || 0
  const isError = errorRate > 0

  const title = `${errorRate}% HTTP error rate`
  const description = `on ${totalRequest} ${pluralize(totalRequest, 'request', 'requests')}`

  return (
    <>
      <CardMetric
        title={title}
        description={description}
        isLoading={isLoadingMetrics || isLoadingMetricsTotalRequest}
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
            <PrivateInstanceHTTPErrorsChart clusterId={clusterId} serviceId={serviceId} containerName={containerName} />
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default CardPrivateHTTPErrors
