import { useMemo, useState } from 'react'
import { useInstantMetrics } from '../../../hooks/use-instant-metrics/use-instant-metrics'
import ModalChart from '../../../modal-chart/modal-chart'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { CardMetric } from '../card-metric/card-metric'
import NetworkRequestDurationChart from '../network-request-duration-chart/network-request-duration-chart'

// NGINX: Query for nginx metrics (to remove when migrating to envoy)
const query = (timeRange: string, ingressName: string) => `
  max_over_time(nginx:request_p99:5m{ingress="${ingressName}"}[${timeRange}])
`

// ENVOY: Query for envoy metrics
const queryEnvoy = (timeRange: string, httpRouteName: string) => `
  max_over_time(envoy_proxy:request_p99:5m{httproute_name="${httpRouteName}"}[${timeRange}])
`

export function CardPercentile99({
  serviceId,
  clusterId,
  ingressName,
  httpRouteName,
}: {
  serviceId: string
  clusterId: string
  ingressName: string
  httpRouteName: string
}) {
  const { queryTimeRange, startTimestamp, endTimestamp } = useDashboardContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // NGINX: Fetch nginx metrics (to remove when migrating to envoy)
  const { data: metricsInSeconds, isLoading: isLoadingMetrics } = useInstantMetrics({
    clusterId,
    query: query(queryTimeRange, ingressName),
    startTimestamp,
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_p99_count',
  })

  // ENVOY: Fetch envoy metrics (only if httpRouteName is configured)
  const { data: metricsEnvoyInMs, isLoading: isLoadingMetricsEnvoy } = useInstantMetrics({
    clusterId,
    query: queryEnvoy(queryTimeRange, httpRouteName),
    startTimestamp,
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_envoy_p99_count',
    enabled: !!httpRouteName,
  })

  // Use max of both sources (convert nginx seconds to ms, envoy already in ms)
  const nginxValue = Math.round(Number(metricsInSeconds?.data?.result[0]?.value[1]) * 1000) || 0
  const envoyValue = Math.round(Number(metricsEnvoyInMs?.data?.result[0]?.value[1])) || 0
  const value = Math.max(nginxValue, envoyValue)
  const defaultThreshold = 250
  const isError = value > defaultThreshold

  const title = `${value}ms network request duration`
  const description = 'for p99'

  const isLoading = useMemo(() => isLoadingMetrics || isLoadingMetricsEnvoy, [isLoadingMetrics, isLoadingMetricsEnvoy])

  return (
    <>
      <CardMetric
        title={title}
        description={description}
        status={isError ? 'RED' : 'GREEN'}
        isLoading={isLoading}
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
              httpRouteName={httpRouteName}
            />
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default CardPercentile99
