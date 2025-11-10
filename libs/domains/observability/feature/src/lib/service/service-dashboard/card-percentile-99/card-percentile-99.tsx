import { useState } from 'react'
import { useInstantMetrics } from '../../../hooks/use-instant-metrics/use-instant-metrics'
import ModalChart from '../../../modal-chart/modal-chart'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { CardMetric } from '../card-metric/card-metric'
import NetworkRequestDurationChart from '../network-request-duration-chart/network-request-duration-chart'

const query = (timeRange: string, ingressName: string) => `
  max_over_time(nginx:request_p99:5m{ingress="${ingressName}"}[${timeRange}])
`

export function CardPercentile99({
  serviceId,
  clusterId,
  ingressName,
}: {
  serviceId: string
  clusterId: string
  ingressName: string
}) {
  const { queryTimeRange, startTimestamp, endTimestamp } = useDashboardContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: metrics, isLoading: isLoadingMetrics } = useInstantMetrics({
    clusterId,
    query: query(queryTimeRange, ingressName),
    startTimestamp,
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_p99_count',
  })

  const value = Math.round(Number(metrics?.data?.result[0]?.value[1]) * 1000) || 0
  const defaultThreshold = 250
  const isError = value > defaultThreshold

  const title = `${value}ms network request duration`
  const description = 'for p99'

  return (
    <>
      <CardMetric
        title={title}
        description={description}
        status={isError ? 'RED' : 'GREEN'}
        isLoading={isLoadingMetrics}
        onClick={() => setIsModalOpen(true)}
        hasModalLink
      />
      {isModalOpen && (
        <ModalChart title={title} open={isModalOpen} onOpenChange={setIsModalOpen}>
          <div className="grid h-full grid-cols-1">
            <NetworkRequestDurationChart
              clusterId={clusterId}
              serviceId={serviceId}
              isFullscreen
              ingressName={ingressName}
            />
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default CardPercentile99
