import { useMemo } from 'react'
import { Line, ReferenceLine } from 'recharts'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart, type ReferenceLineEvent } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function InstanceAutoscalingChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const { startTimestamp, endTimestamp, useLocalTime, hideEvents, hoveredEventKey, setHoveredEventKey } =
    useServiceOverviewContext()

  const { data: metricsNumberOfInstances, isLoading: isLoadingNumberOfInstances } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum(kube_pod_status_ready{condition="true"} * on(namespace,pod) group_left(label_qovery_com_service_id) max by(namespace,pod,label_qovery_com_service_id)(kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}))`,
  })

  const { data: metricsHpaMinReplicas, isLoading: isLoadingHpaMinReplicas } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `max by(label_qovery_com_service_id)(kube_horizontalpodautoscaler_spec_min_replicas * on(namespace,horizontalpodautoscaler) group_left(label_qovery_com_service_id) max by(namespace,horizontalpodautoscaler,label_qovery_com_service_id)(kube_horizontalpodautoscaler_labels{label_qovery_com_service_id=~"${serviceId}"}))`,
  })

  const { data: metricsHpaMaxReplicas, isLoading: isLoadingHpaMaxReplicas } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `max by(label_qovery_com_service_id)(kube_horizontalpodautoscaler_spec_max_replicas * on(namespace,horizontalpodautoscaler) group_left(label_qovery_com_service_id) max by(namespace,horizontalpodautoscaler,label_qovery_com_service_id)(kube_horizontalpodautoscaler_labels{label_qovery_com_service_id=~"${serviceId}"}))`,
  })

  const { data: metricsHpaMaxLimitReached, isLoading: isHpaMaxLimitReached } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by (label_qovery_com_service_id) (
  increase(
    kube_horizontalpodautoscaler_status_condition{
      condition = "ScalingLimited",
      status    = "true"
    }[5m]
  )
  *
  on (namespace, horizontalpodautoscaler) group_left(label_qovery_com_service_id)
  (
    max by (namespace, horizontalpodautoscaler)(
      kube_horizontalpodautoscaler_status_current_replicas
    )
    == bool on (namespace, horizontalpodautoscaler)
    max by (namespace, horizontalpodautoscaler)(
      kube_horizontalpodautoscaler_spec_max_replicas
    )
  )
  *
  on (namespace, horizontalpodautoscaler) group_left(label_qovery_com_service_id)
  max by (namespace, horizontalpodautoscaler, label_qovery_com_service_id)(
    kube_horizontalpodautoscaler_labels{
      label_qovery_com_service_id =~ "${serviceId}"
    }
  ) > 0
)`,
  })

  const chartData = useMemo(() => {
    // Merge healthy and unhealthy metrics into a single timeSeriesMap
    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process number of instances
    if (metricsNumberOfInstances?.data?.result) {
      processMetricsData(
        metricsNumberOfInstances,
        timeSeriesMap,
        () => 'Number of instances',
        (value) => parseFloat(value),
        useLocalTime
      )
    }
    // Process HPA min replicas
    if (metricsHpaMinReplicas?.data?.result) {
      processMetricsData(
        metricsHpaMinReplicas,
        timeSeriesMap,
        () => 'Autoscaling min replicas',
        (value) => parseFloat(value),
        useLocalTime
      )
    }
    // Process HPA max replicas
    if (metricsHpaMaxReplicas?.data?.result) {
      processMetricsData(
        metricsHpaMaxReplicas,
        timeSeriesMap,
        () => 'Autoscaling max replicas',
        (value) => parseFloat(value),
        useLocalTime
      )
    }

    // Convert map to sorted array and add time range padding
    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)
    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [
    metricsNumberOfInstances,
    metricsHpaMinReplicas,
    metricsHpaMaxReplicas,
    useLocalTime,
    startTimestamp,
    endTimestamp,
  ])

  const referenceLineData = useMemo(() => {
    if (metricsHpaMaxLimitReached?.data?.result && !metricsHpaMaxLimitReached?.data?.result) return []

    const referenceLines: ReferenceLineEvent[] = []

    // Add hpa max limit reached lines
    if (metricsHpaMaxLimitReached?.data?.result) {
      metricsHpaMaxLimitReached.data.result.forEach(
        (series: { metric: { pod: string }; values: [number, string][] }) => {
          series.values.forEach(([timestamp, value]: [number, string]) => {
            const numValue = parseFloat(value)
            if (numValue > 0) {
              const key = `${series.metric.pod}-${timestamp}`
              referenceLines.push({
                type: 'exit-code',
                timestamp: timestamp * 1000,
                reason: 'ScalingLimited',
                description:
                  'Auto scaling reached the maximum number of replicas. You can increase it in the settings.',
                icon: 'exclamation',
                key,
              })
            }
          })
        }
      )
    }

    // Sort by timestamp ascending
    referenceLines.sort((a, b) => b.timestamp - a.timestamp)
    return referenceLines
  }, [metricsHpaMaxLimitReached])

  return (
    <LocalChart
      data={chartData || []}
      isLoading={
        isLoadingNumberOfInstances || isLoadingHpaMinReplicas || isLoadingHpaMaxReplicas || isHpaMaxLimitReached
      }
      isEmpty={(chartData || []).length === 0}
      tooltipLabel="Autoscaling limit reached"
      unit="instance"
      serviceId={serviceId}
      margin={{ top: 14, bottom: 0, left: 0, right: 0 }}
      yDomain={[0, 'dataMax + 1']}
      referenceLineData={referenceLineData}
      isFullscreen={true}
    >
      <Line
        key="instance"
        dataKey="Number of instances"
        stroke="var(--color-green-500)"
        isAnimationActive={false}
        dot={false}
        strokeWidth={2}
      />
      <Line
        key="min"
        dataKey="Autoscaling min replicas"
        type="linear"
        stroke="var(--color-neutral-300)"
        strokeDasharray="4 4"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />
      <Line
        key="max"
        dataKey="Autoscaling max replicas"
        type="linear"
        stroke="var(--color-red-500)"
        strokeDasharray="4 4"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />

      {!hideEvents && (
        <>
          {referenceLineData
            .filter((event) => event.type === 'exit-code')
            .map((event) => (
              <ReferenceLine
                key={event.key}
                x={event.timestamp}
                stroke="var(--color-red-500)"
                strokeDasharray="3 3"
                opacity={hoveredEventKey === event.key ? 1 : 0.3}
                strokeWidth={2}
                onMouseEnter={() => setHoveredEventKey(event.key)}
                onMouseLeave={() => setHoveredEventKey(null)}
                label={{
                  value: hoveredEventKey === event.key ? event.reason : undefined,
                  position: 'top',
                  fill: 'var(--color-red-500)',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              />
            ))}
        </>
      )}
    </LocalChart>
  )
}

export default InstanceAutoscalingChart
