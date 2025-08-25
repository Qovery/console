import { useState } from 'react'
import { match } from 'ts-pattern'
import { useService } from '@qovery/domains/services/feature'
import { Heading, Icon, Section, Skeleton, Tooltip } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetricButton } from '../card-metric/card-metric'
import { InstanceStatusChart } from '../instance-status-chart/instance-status-chart'
import { ModalChart } from '../modal-chart/modal-chart'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

// TODO PG may be improved
const query = (serviceId: string, timeRange: string) => `
  (
    round(
      max_over_time(
        (
          sum(
            increase(
              kube_pod_container_status_restarts_total{container!="POD"}[${timeRange}:]
            )
            * on(namespace, pod) group_left(label_qovery_com_service_id)
              max by(namespace, pod, label_qovery_com_service_id)(
                kube_pod_labels{label_qovery_com_service_id="${serviceId}"}
              )
          )
          or vector(0)
        )[${timeRange}:]
      )
    )
  )
  +
  sum_over_time(
    (
      sum(
        (
          kube_pod_container_status_waiting_reason{
            container!="POD",
            reason!~"ContainerCreating|PodInitializing|Completed"
          }
          * on(namespace, pod) group_left(label_qovery_com_service_id)
            kube_pod_labels{label_qovery_com_service_id="${serviceId}"}
        )
        or vector(0)
      )
    )[${timeRange}:]
  )
`

// TODO PG remove [5m] par $__rate_interval
// TODO PG may be improved
const queryAutoscalingReached = (serviceId: string, timeRange: string) => `
  max_over_time(
    (
    sum by (label_qovery_com_service_id) (

      increase(
        kube_horizontalpodautoscaler_status_condition{
          condition="ScalingLimited", status="true"
        }[5m]
      )
      *
      on(namespace, horizontalpodautoscaler) group_left(label_qovery_com_service_id)
      (
        max by(namespace, horizontalpodautoscaler)(
          kube_horizontalpodautoscaler_status_current_replicas
        )
        == bool on(namespace, horizontalpodautoscaler)
        max by(namespace, horizontalpodautoscaler)(
          kube_horizontalpodautoscaler_spec_max_replicas
        )
      )
      *
      on(namespace, horizontalpodautoscaler) group_left(label_qovery_com_service_id)
      max by(namespace, horizontalpodautoscaler, label_qovery_com_service_id)(
        kube_horizontalpodautoscaler_labels{
          label_qovery_com_service_id="${serviceId}"
        }
      )
    ) > bool 0
  )[${timeRange}:])
`

export function CardInstanceStatus({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { queryTimeRange } = useServiceOverviewContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: service } = useService({ serviceId })
  const { data: metricsInstanceErrors, isLoading: isLoadingMetricsInstanceErrors } = useMetrics({
    clusterId,
    query: query(serviceId, queryTimeRange),
    queryRange: 'query',
  })
  const { data: metricsAutoscalingReached, isLoading: isLoadingMetricsAutoscalingReached } = useMetrics({
    clusterId,
    query: queryAutoscalingReached(serviceId, queryTimeRange),
    queryRange: 'query',
  })

  const instanceErrors = Math.round(Number(metricsInstanceErrors?.data?.result[0]?.value[1])) || 0
  const autoscalingReached = metricsAutoscalingReached?.data?.result[0]?.value[1] || 0

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
                  Auto-scaling limit reached <span className="font-medium">{autoscalingReached}</span>
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
          <InstanceStatusChart clusterId={clusterId} serviceId={serviceId} />
        </div>
      </Section>
      {isModalOpen && (
        <ModalChart title={title} description={description} open={isModalOpen} onOpenChange={setIsModalOpen}>
          <div className="grid h-full grid-cols-1">
            <InstanceStatusChart clusterId={clusterId} serviceId={serviceId} isFullscreen />
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default CardInstanceStatus
