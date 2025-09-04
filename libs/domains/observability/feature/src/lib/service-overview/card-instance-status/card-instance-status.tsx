import { useState } from 'react'
import { match } from 'ts-pattern'
import { useService } from '@qovery/domains/services/feature'
import { Heading, Icon, Section, Skeleton, Tooltip } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { useInstantMetrics } from '../../hooks/use-instant-metrics.ts/use-instant-metrics'
import { CardMetricButton } from '../card-metric/card-metric'
import { InstanceStatusChart } from '../instance-status-chart/instance-status-chart'
import { ModalChart } from '../modal-chart/modal-chart'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const query = (timeRange: string, containerName: string) => `
  sum(increase(kube_pod_container_status_restarts_total{container="${containerName}"}[${timeRange}]))
  +
  count(
    max by (pod) (
      max_over_time(
        kube_pod_container_status_waiting_reason{
          container="${containerName}",
          reason!~"ContainerCreating|PodInitializing|Completed"
        }[${timeRange}]
      )
    ) > 0
  )
`
const queryAutoscalingReached = (timeRange: string, containerName: string) => `
  100 *
  avg_over_time(
  (
    max by (namespace, horizontalpodautoscaler) (
      kube_horizontalpodautoscaler_status_condition{
        condition="ScalingLimited", status="true",
        horizontalpodautoscaler="${containerName}"
      }
    )
    *
    (
      max by (namespace, horizontalpodautoscaler) (
        kube_horizontalpodautoscaler_status_current_replicas{
          horizontalpodautoscaler="${containerName}"
        }
      )
      == bool
      max by (namespace, horizontalpodautoscaler) (
        kube_horizontalpodautoscaler_spec_max_replicas{
          horizontalpodautoscaler="${containerName}"
        }
      )
    )
  )[${timeRange}:30s]
)
`

export function CardInstanceStatus({
  serviceId,
  clusterId,
  containerName,
}: {
  serviceId: string
  clusterId: string
  containerName: string
}) {
  const { queryTimeRange, endTimestamp } = useServiceOverviewContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: service } = useService({ serviceId })
  const { data: metricsInstanceErrors, isLoading: isLoadingMetricsInstanceErrors } = useInstantMetrics({
    clusterId,
    query: query(queryTimeRange, containerName),
    endTimestamp,
  })
  const { data: metricsAutoscalingReached, isLoading: isLoadingMetricsAutoscalingReached } = useInstantMetrics({
    clusterId,
    query: queryAutoscalingReached(queryTimeRange, containerName),
    endTimestamp,
  })

  const instanceErrors = Math.round(Number(metricsInstanceErrors?.data?.result[0]?.value[1])) || 0
  const autoscalingReachedRaw = metricsAutoscalingReached?.data?.result[0]?.value[1] || '0'
  const autoscalingReachedNum = parseFloat(autoscalingReachedRaw)
  const autoscalingReached = Number(autoscalingReachedNum.toFixed(1))

  const title = 'Instance number'
  const description = 'Number of healthy and unhealthy instances over time.'
  const isLoading = isLoadingMetricsInstanceErrors || isLoadingMetricsAutoscalingReached

  const isAutoscalingEnabled = match(service)
    .with({ serviceType: 'APPLICATION' }, (s) => s.max_running_instances !== s.min_running_instances)
    .with({ serviceType: 'CONTAINER' }, (s) => s.max_running_instances !== s.min_running_instances)
    .otherwise(() => false)

  return (
    <>
      <Section className="w-full cursor-default rounded border border-neutral-250 bg-neutral-50">
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex items-center gap-1.5">
            <Heading weight="medium">{title}</Heading>
            <Tooltip content={description}>
              <span>
                <Icon iconName="circle-info" iconStyle="regular" className="text-sm text-neutral-350" />
              </span>
            </Tooltip>
          </div>
          <div className="flex items-center gap-5">
            {isAutoscalingEnabled && (
              <Skeleton show={isLoading} width={174} height={16}>
                <span className="text-ssm text-neutral-400">
                  Auto-scaling limit hit rate <span className="font-medium">{autoscalingReached}% </span>
                </span>
              </Skeleton>
            )}
            <Skeleton show={isLoading} width={106} height={16}>
              <span className="text-ssm text-neutral-400">
                Instance {pluralize(instanceErrors, 'error', 'errors')}{' '}
                <span className="font-medium">{instanceErrors}</span>
              </span>
            </Skeleton>
            <CardMetricButton onClick={() => setIsModalOpen(true)} hasModalLink />
          </div>
        </div>
        <div>
          <InstanceStatusChart clusterId={clusterId} serviceId={serviceId} containerName={containerName} />
        </div>
      </Section>
      {isModalOpen && (
        <ModalChart title={title} description={description} open={isModalOpen} onOpenChange={setIsModalOpen}>
          <div className="grid h-full grid-cols-1">
            <InstanceStatusChart
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

export default CardInstanceStatus
