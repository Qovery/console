import { useState } from 'react'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { InstanceStatusChart } from '../instance-status-chart/instance-status-chart'
import { ModalChart } from '../modal-chart/modal-chart'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function CardInstanceStatus({
  organizationId,
  serviceId,
  clusterId,
}: {
  organizationId: string
  serviceId: string
  clusterId: string
}) {
  const { timeRange } = useServiceOverviewContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: `
    (
      round(
        sum(
          increase(
            kube_pod_container_status_restarts_total{container!="POD"}[${timeRange}]
          )
          * on(namespace, pod) group_left(label_qovery_com_service_id)
            max by(namespace, pod, label_qovery_com_service_id)(
              kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}
            )
        )
      )
      or vector(0)
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
              kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}
          )
          or vector(0)
        )
      )[${timeRange}:]
    )
  `,
    queryRange: 'query',
  })

  const value = Math.round(Number(metrics?.data?.result[0]?.value[1])) || 0
  const isError = value > 0

  const title = 'Instance issues'

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
        <ModalChart
          title={title}
          description="The number of healthy and unhealthy instances over time."
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        >
          <div className="grid h-full grid-cols-1">
            <InstanceStatusChart organizationId={organizationId} clusterId={clusterId} serviceId={serviceId} />
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default CardInstanceStatus
