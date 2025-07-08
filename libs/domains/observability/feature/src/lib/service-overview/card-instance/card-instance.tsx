import { pluralize } from '@qovery/shared/util-js'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function CardInstance({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { timeRange } = useServiceOverviewContext()
  const { data: metricsAutoscalingReached, isLoading: isLoadingMetricsAutoscalingReached } = useMetrics({
    clusterId,
    query: `sum by(label_qovery_com_service_id) (
    (
      changes(
        kube_horizontalpodautoscaler_status_condition{
          condition = "ScalingLimited",
          status    = "true"
        }[${timeRange}]
      ) / 1
    )
    * on(namespace, horizontalpodautoscaler) group_left(label_qovery_com_service_id)
      max by(namespace, horizontalpodautoscaler, label_qovery_com_service_id)(
        kube_horizontalpodautoscaler_labels{
          label_qovery_com_service_id =~ "${serviceId}"
        }
      )
  ) 
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

  return (
    <CardMetric
      title="Autoscaling limit reached"
      value={autoscalingReached}
      status={autoscalingReached > 0 ? 'RED' : 'GREEN'}
      isLoading={isLoadingMetricsAutoscalingReached || isLoadingMetricsMaxInstances}
      description={
        isError
          ? `Blocked by max instance limit (${maxInstances})`
          : `Max ${pluralize(maxInstances, 'instance', 'instances')}: ${maxInstances}`
      }
    />
  )
}

export default CardInstance
