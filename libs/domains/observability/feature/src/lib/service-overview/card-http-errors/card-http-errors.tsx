import { useState } from 'react'
import { pluralize } from '@qovery/shared/util-js'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { InstanceHTTPErrorsChart } from '../instance-http-errors-chart/instance-http-errors-chart'
import { ModalChart } from '../modal-chart/modal-chart'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const query = (serviceId: string, timeRange: string) => `
  100 *
  sum(
    increase(nginx_ingress_controller_requests{status=~"499|5.."}[${timeRange}])
      * on(ingress) group_left(label_qovery_com_associated_service_id)
        max by(ingress, label_qovery_com_associated_service_id)(
          kube_ingress_labels{label_qovery_com_associated_service_id =~ "${serviceId}"}
        )
  )
  /
  clamp_min(
    sum(
      increase(nginx_ingress_controller_requests[${timeRange}])
        * on(ingress) group_left(label_qovery_com_associated_service_id)
          max by(ingress, label_qovery_com_associated_service_id)(
            kube_ingress_labels{label_qovery_com_associated_service_id =~ "${serviceId}"}
          )
    ),
    1
  ) or vector(0)
`

const queryTotalRequest = (serviceId: string, timeRange: string) => `
    sum(
      increase(nginx_ingress_controller_requests[${timeRange}])
        * on(ingress) group_left(label_qovery_com_associated_service_id)
          max by(ingress, label_qovery_com_associated_service_id)(
            kube_ingress_labels{label_qovery_com_associated_service_id =~ "${serviceId}"}
          )
          or vector(0)
    )
`

export function CardHTTPErrors({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { queryTimeRange } = useServiceOverviewContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: query(serviceId, queryTimeRange),
    queryRange: 'query',
  })

  const { data: metricsTotalRequest, isLoading: isLoadingMetricsTotalRequest } = useMetrics({
    clusterId,
    query: queryTotalRequest(serviceId, queryTimeRange),
    queryRange: 'query',
  })

  const value = Math.round(metrics?.data?.result[0]?.value[1]) || 0
  const totalRequest = Math.round(metricsTotalRequest?.data?.result[0]?.value[1]) || 0
  const isError = value > 0

  const title = `${value}% HTTP error rate`
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
            <InstanceHTTPErrorsChart clusterId={clusterId} serviceId={serviceId} />
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default CardHTTPErrors
