import { useState } from 'react'
import { useInstantMetrics } from '../../../hooks/use-instant-metrics/use-instant-metrics'
import { ModalChart } from '../../../modal-chart/modal-chart'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { CardMetric } from '../card-metric/card-metric'
import { PrivateNetworkRequestDurationChart } from '../private-network-request-duration-chart/private-network-request-duration-chart'

const query = (timeRange: string, containerName: string) => `
   max_over_time(beyla:http_server_p99:5m{k8s_container_name="${containerName}"}[${timeRange}])
`

export function CardPrivatePercentile99({
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

  const { data: metrics, isLoading: isLoadingMetrics } = useInstantMetrics({
    clusterId,
    query: query(queryTimeRange, containerName),
    startTimestamp,
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_private_p99_count',
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
            <PrivateNetworkRequestDurationChart
              clusterId={clusterId}
              serviceId={serviceId}
              containerName={containerName}
              isFullscreen
            />
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default CardPrivatePercentile99
