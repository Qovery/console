import { useState } from 'react'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { InstanceHTTPErrorsChart } from '../instance-http-errors-chart/instance-http-errors-chart'
import { ModalChart } from '../modal-chart/modal-chart'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const query = (serviceId: string, timeRange: string) => `
  100 *
  sum(
    rate(nginx_ingress_controller_requests{status!~"2.."}[${timeRange}])
      * on(ingress) group_left(label_qovery_com_associated_service_id)
        max by(ingress, label_qovery_com_associated_service_id)(
          kube_ingress_labels{label_qovery_com_associated_service_id =~ "${serviceId}"}
        )
  )
  /
  clamp_min(
    sum(
      rate(nginx_ingress_controller_requests[${timeRange}])
        * on(ingress) group_left(label_qovery_com_associated_service_id)
          max by(ingress, label_qovery_com_associated_service_id)(
            kube_ingress_labels{label_qovery_com_associated_service_id =~ "${serviceId}"}
          )
    ),
    1
  ) or vector(0)
`

export function CardHTTPErrors({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { timeRange } = useServiceOverviewContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: query(serviceId, timeRange),
    queryRange: 'query',
    timeRange,
  })

  const value = Math.round(metrics?.data?.result[0]?.value[1]) || 0
  const isError = value > 0

  const title = 'HTTP error rate'

  return (
    <>
      <CardMetric
        title={title}
        value={`${value}%`}
        status={isError ? 'RED' : 'GREEN'}
        description={`in the last ${timeRange}`}
        isLoading={isLoadingMetrics}
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
