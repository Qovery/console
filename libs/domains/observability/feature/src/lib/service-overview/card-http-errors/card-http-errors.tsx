import { useState } from 'react'
import { pluralize } from '@qovery/shared/util-js'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { InstanceHTTPErrorsChart } from '../instance-http-errors-chart/instance-http-errors-chart'
import { ModalChart } from '../modal-chart/modal-chart'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryErrorRequest = (timeRange: string, ingressName: string) => `
    sum(increase(nginx_ingress_controller_requests{ingress="${ingressName}", status=~"499|5.."}[${timeRange}]))
`

const queryTotalRequest = (timeRange: string, ingressName: string) => `
    sum(increase(nginx_ingress_controller_requests{ingress="${ingressName}"}[${timeRange}]))
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
  const { queryTimeRange } = useServiceOverviewContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // TODO fix query
  const { data: metricsErrorRequest, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: queryErrorRequest(queryTimeRange, ingressName),
    queryRange: 'query',
  })

  const { data: metricsTotalRequest, isLoading: isLoadingMetricsTotalRequest } = useMetrics({
    clusterId,
    query: queryTotalRequest(queryTimeRange, ingressName),
    queryRange: 'query',
  })

  const errorRaw = Math.round(metricsErrorRequest?.data?.result[0]?.value[1])
  const totalRequest = Math.round(metricsTotalRequest?.data?.result[0]?.value[1]) || 0
  const errorRate = Math.round(totalRequest > 0 ? errorRaw / totalRequest : 0) || 0
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
            <InstanceHTTPErrorsChart clusterId={clusterId} serviceId={serviceId} containerName={containerName} />
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default CardHTTPErrors
