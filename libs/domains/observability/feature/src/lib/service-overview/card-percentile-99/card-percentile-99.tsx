import { useState } from 'react'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import ModalChart from '../modal-chart/modal-chart'
import NetworkRequestDurationChart from '../network-request-duration-chart/network-request-duration-chart'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const query = (serviceId: string, timeRange: string) => `
  max_over_time(
    histogram_quantile(
      0.99,
      (
        sum by(le, ingress) (
          rate(nginx_ingress_controller_request_duration_seconds_bucket[1m])
        )
        * on(ingress) group_left(label_qovery_com_associated_service_id)
          max by(ingress, label_qovery_com_associated_service_id)(
            kube_ingress_labels{
              label_qovery_com_associated_service_id =~ "${serviceId}"
            }
          )
      )
    )[${timeRange}:]
  )
`

export function CardPercentile99({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { timeRange } = useServiceOverviewContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: query(serviceId, timeRange),
    queryRange: 'query',
    timeRange,
  })

  const value = Math.round(Number(metrics?.data?.result[0]?.value[1]) * 1000) || 0
  const isError = value > 150

  const title = '99th percentile'

  return (
    <>
      <CardMetric
        title={title}
        value={value}
        status={isError ? 'RED' : 'GREEN'}
        description={`in last ${timeRange}`}
        isLoading={isLoadingMetrics}
        onClick={() => setIsModalOpen(true)}
        hasModalLink
      />
      {isModalOpen && (
        <ModalChart title={title} open={isModalOpen} onOpenChange={setIsModalOpen}>
          <div className="grid h-full grid-cols-1">
            <NetworkRequestDurationChart clusterId={clusterId} serviceId={serviceId} isFullscreen />
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default CardPercentile99
