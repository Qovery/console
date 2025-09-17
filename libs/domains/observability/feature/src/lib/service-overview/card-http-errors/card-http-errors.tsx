import { useState } from 'react'
import { pluralize } from '@qovery/shared/util-js'
import { useInstantMetrics } from '../../hooks/use-instant-metrics/use-instant-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { InstanceHTTPErrorsChart } from '../instance-http-errors-chart/instance-http-errors-chart'
import { ModalChart } from '../modal-chart/modal-chart'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryErrorRequest = (timeRange: string, ingressName: string) => `
   sum(sum_over_time(
    (nginx:req_inc:5m_by_status{ingress="${ingressName}", status=~"499|5.."})[${timeRange}:5m]
  ))
`

const queryTotalRequest = (timeRange: string, ingressName: string) => `
  sum_over_time(
    (nginx:req_inc:5m{ingress="${ingressName}"})[${timeRange}:5m]
  )
`

export function CardHTTPErrors({
  serviceId,
  clusterId,
  containerName,
  ingressName,
}: {
  serviceId: string
  clusterId: string
  containerName: string
  ingressName: string
}) {
  const { queryTimeRange, endTimestamp } = useServiceOverviewContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: metricsErrorRequest, isLoading: isLoadingMetrics } = useInstantMetrics({
    clusterId,
    query: queryErrorRequest(queryTimeRange, ingressName),
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_req_errors_number',
  })

  const { data: metricsTotalRequest, isLoading: isLoadingMetricsTotalRequest } = useInstantMetrics({
    clusterId,
    query: queryTotalRequest(queryTimeRange, ingressName),
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_req_all_number',
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
            <InstanceHTTPErrorsChart
              clusterId={clusterId}
              serviceId={serviceId}
              containerName={containerName}
              ingressName={ingressName}
            />
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default CardHTTPErrors
