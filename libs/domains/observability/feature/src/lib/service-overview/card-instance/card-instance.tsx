import { useState } from 'react'
import { pluralize } from '@qovery/shared/util-js'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { InstanceAutoscalingChart } from '../instance-autoscaling-chart/instance-autoscaling-chart'
import ModalChart from '../modal-chart/modal-chart'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function CardInstance({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { timeRange } = useServiceOverviewContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: metricsAutoscalingReached, isLoading: isLoadingMetricsAutoscalingReached } = useMetrics({
    clusterId,
    query: `max_over_time(
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
          label_qovery_com_service_id =~ "${serviceId}"
        }
      )
    ) > bool 0
  )[${timeRange}:])

    `,
    queryRange: 'query',
  })

  const { data: metricsMaxInstances, isLoading: isLoadingMetricsMaxInstances } = useMetrics({
    clusterId,
    query: `
    max_over_time(
      count(
        kube_pod_status_ready{condition="true"}
          * on(namespace, pod) group_left(label_qovery_com_service_id)
            max by(namespace, pod, label_qovery_com_service_id)(
              kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}
            )
      )[${timeRange}:]
    )
  `,
    queryRange: 'query',
  })

  const autoscalingReached = metricsAutoscalingReached?.data?.result[0]?.value[1] ?? 0
  const maxInstances = metricsMaxInstances?.data?.result[0]?.value[1] ?? 0

  const isError = autoscalingReached > 0

  const title = 'Autoscaling limit reached'

  return (
    <>
      <CardMetric
        title={title}
        value={autoscalingReached}
        status={autoscalingReached > 0 ? 'RED' : 'GREEN'}
        isLoading={isLoadingMetricsAutoscalingReached || isLoadingMetricsMaxInstances}
        description={
          isError
            ? `Blocked max ${maxInstances} ${pluralize(maxInstances, 'instance', 'instances')}`
            : `Max ${pluralize(maxInstances, 'instance', 'instances')}: ${maxInstances}`
        }
        onClick={() => setIsModalOpen(true)}
        hasModalLink
      />
      {isModalOpen && (
        <ModalChart
          title={title}
          description="The number of instances over time."
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        >
          <div className="grid h-full grid-cols-1">
            <InstanceAutoscalingChart clusterId={clusterId} serviceId={serviceId} />
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default CardInstance
