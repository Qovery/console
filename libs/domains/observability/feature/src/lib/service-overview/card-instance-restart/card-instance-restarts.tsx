import { useState } from 'react'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { CpuChart } from '../cpu-chart/cpu-chart'
import MemoryChart from '../memory-chart/memory-chart'
import ModalChart from '../modal-chart/modal-chart'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function CardInstanceRestarts({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { timeRange } = useServiceOverviewContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: `
    round(
      (
        sum(
          (
            changes(kube_pod_container_status_last_terminated_exitcode{container!="POD"}[${timeRange}]) 
          )
          * on(namespace,pod,container)
            (kube_pod_container_status_last_terminated_exitcode{container!="POD"} > 0)
          * on(namespace,pod) group_left(label_qovery_com_service_id)
            max by(namespace,pod,label_qovery_com_service_id)(
              kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}
            )
        )
      ) or vector(0)
    )
  `,
    queryRange: 'query',
  })

  const value = Math.round(Number(metrics?.data?.result[0]?.value[1]))
  const isError = value > 0

  const title = 'Instance restarts'

  return (
    <>
      <CardMetric
        title={title}
        value={value}
        status={isError ? 'YELLOW' : 'GREEN'}
        description={`in last ${timeRange}`}
        isLoading={isLoadingMetrics}
        onClick={() => setIsModalOpen(true)}
      />
      {isModalOpen && (
        <ModalChart title={title} open={isModalOpen} onOpenChange={setIsModalOpen}>
          <div className="grid h-full grid-cols-1">
            <CpuChart clusterId={clusterId} serviceId={serviceId} fullscreen={false} />
            <hr className="border-neutral-200" />
            <MemoryChart clusterId={clusterId} serviceId={serviceId} fullscreen={false} />
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default CardInstanceRestarts
