import { useMemo, useState } from 'react'
import { useInstantMetrics } from '../../hooks/use-instant-metrics.ts/use-instant-metrics'
import { calculateRateInterval } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import ModalChart from '../modal-chart/modal-chart'
import PrivateNetworkRequestDurationChart from '../private-network-request-duration-chart/private-network-request-duration-chart'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const query = (timeRange: string, rateInterval: string, containerName: string) => `
  max_over_time(histogram_quantile(0.99, (sum by(le) (rate(http_server_request_duration_seconds_bucket{k8s_container_name="${containerName}"}[${rateInterval}]))))[${timeRange}:])
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
  const { queryTimeRange, startTimestamp, endTimestamp } = useServiceOverviewContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const rateInterval = useMemo(
    () => calculateRateInterval(startTimestamp, endTimestamp),
    [startTimestamp, endTimestamp]
  )

  const { data: metrics, isLoading: isLoadingMetrics } = useInstantMetrics({
    clusterId,
    query: query(queryTimeRange, rateInterval, containerName),
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
