import { useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { useService } from '@qovery/domains/services/feature'
import { Heading, Icon, Section, Skeleton, Tooltip } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { useInstantMetrics } from '../../../hooks/use-instant-metrics/use-instant-metrics'
import { ModalChart } from '../../../modal-chart/modal-chart'
import { buildPromSelector } from '../../../util-chart/build-selector'
import { useDashboardContext } from '../../../util-filter/dashboard-context'
import { CardMetricButton } from '../card-metric/card-metric'
import { InstanceStatusChart } from '../instance-status-chart/instance-status-chart'

const query = (timeRange: string, selector: string) => `
  sum(increase(kube_pod_container_status_restarts_total{${selector}}[${timeRange}]))
  +
  count(
    max by (pod) (
      max_over_time(
        kube_pod_container_status_waiting_reason{
          ${selector},
          reason!~"ContainerCreating|PodInitializing|Completed"
        }[${timeRange}]
      )
    ) > 0
  )
`

const queryK8sEvents = (serviceId: string, timeRange: string) => `
  sum(
    increase(
      k8s_event_logger_q_k8s_events_total{
        qovery_com_service_id="${serviceId}",
        reason=~"Failed|OOMKilled|BackOff|Evicted|FailedScheduling|FailedMount|FailedAttachVolume|Preempted|NodeNotReady",
        type="Warning"
      }[${timeRange}]
    )
  ) or vector(0)
`

// TODO PG think to use recorder rule
const queryAutoscalingReached = (timeRange: string, subQueryTimeRange: string, containerName: string) => `
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
  )[${timeRange}:${subQueryTimeRange}]
)
`

export function CardInstanceStatus({
  serviceId,
  clusterId,
  containerName,
  namespace,
  podNames,
}: {
  serviceId: string
  clusterId: string
  containerName: string
  namespace: string
  podNames?: string[]
}) {
  const { queryTimeRange, subQueryTimeRange, startTimestamp, endTimestamp } = useDashboardContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const selector = useMemo(() => buildPromSelector(containerName, podNames), [containerName, podNames])

  const { data: service } = useService({ serviceId })
  const { data: metricsInstanceErrors, isLoading: isLoadingMetricsInstanceErrors } = useInstantMetrics({
    clusterId,
    query: query(queryTimeRange, selector),
    startTimestamp,
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_instance_status_error_count',
  })
  const { data: metricsK8sEvents, isLoading: isLoadingMetricsK8sEvents } = useInstantMetrics({
    clusterId,
    query: queryK8sEvents(serviceId, queryTimeRange),
    startTimestamp,
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_instance_status_k8s_event_count',
  })
  const { data: metricsAutoscalingReached, isLoading: isLoadingMetricsAutoscalingReached } = useInstantMetrics({
    clusterId,
    query: queryAutoscalingReached(queryTimeRange, subQueryTimeRange, containerName),
    startTimestamp,
    endTimestamp,
    boardShortName: 'service_overview',
    metricShortName: 'card_instance_hpa_limit_count',
  })

  const instanceErrorsValue = Math.round(Number(metricsInstanceErrors?.data?.result[0]?.value[1])) || 0
  const k8sEventsValue = Math.round(Number(metricsK8sEvents?.data?.result[0]?.value[1])) || 0
  const instanceErrors = instanceErrorsValue + k8sEventsValue
  const autoscalingReachedRaw = metricsAutoscalingReached?.data?.result[0]?.value[1] || '0'
  const autoscalingReachedNum = parseFloat(autoscalingReachedRaw)
  const autoscalingReached = Number(autoscalingReachedNum.toFixed(1))

  const title = 'Instance number'
  const description = 'Number of healthy and unhealthy instances over time.'
  const isLoading = isLoadingMetricsInstanceErrors || isLoadingMetricsK8sEvents || isLoadingMetricsAutoscalingReached

  const isAutoscalingEnabled = match(service)
    .with({ serviceType: 'APPLICATION' }, (s) => s.max_running_instances !== s.min_running_instances)
    .with({ serviceType: 'CONTAINER' }, (s) => s.max_running_instances !== s.min_running_instances)
    .otherwise(() => false)

  return (
    <>
      <Section className="w-full cursor-default rounded-lg border border-neutral bg-surface-neutral">
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex items-center gap-1">
            <Heading weight="medium" level={3}>
              {title}
            </Heading>
            <Tooltip content={description}>
              <span>
                <Icon iconName="circle-info" iconStyle="regular" className="text-xs text-neutral-subtle" />
              </span>
            </Tooltip>
          </div>
          <div className="flex items-center gap-5">
            {isAutoscalingEnabled && (
              <Skeleton show={isLoading} width={174} height={16}>
                <span className="text-ssm text-neutral">
                  Auto-scaling limit hit rate <span className="font-medium">{autoscalingReached}% </span>
                </span>
              </Skeleton>
            )}
            <Skeleton show={isLoading} width={106} height={16}>
              <span className="text-ssm text-neutral">
                Instance {pluralize(instanceErrors, 'error', 'errors')}{' '}
                <span className="font-medium">{instanceErrors}</span>
              </span>
            </Skeleton>
            <CardMetricButton onClick={() => setIsModalOpen(true)} hasModalLink />
          </div>
        </div>
        <div>
          <InstanceStatusChart
            clusterId={clusterId}
            serviceId={serviceId}
            containerName={containerName}
            namespace={namespace}
            podNames={podNames}
          />
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
              namespace={namespace}
              podNames={podNames}
            />
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default CardInstanceStatus
