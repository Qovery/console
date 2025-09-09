import { useMemo } from 'react'
import { Area, Line, ReferenceLine } from 'recharts'
import { calculateDynamicRange, calculateRateInterval, useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart, type ReferenceLineEvent } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryUnhealthyPods = (serviceId: string) => `
  sum (kube_pod_status_ready{condition="false"}
* on(namespace,pod) group_left(label_qovery_com_service_id)
  max by(namespace,pod,label_qovery_com_service_id)(
    kube_pod_labels{label_qovery_com_service_id="${serviceId}"}
  )) > 0
`

const queryHealthyPods = (serviceId: string) => `
  sum (kube_pod_status_ready{condition="true"}
* on(namespace,pod) group_left(label_qovery_com_service_id)
  max by(namespace,pod,label_qovery_com_service_id)(
    kube_pod_labels{label_qovery_com_service_id="${serviceId}"}
  )) >0
`

const queryRestartWithReason = (containerName: string, timeRange: string) => `
sum by (reason) (
  sum by (pod) (
    increase(kube_pod_container_status_restarts_total{container="${containerName}"}[${timeRange}])
  )
  *
  on(pod) group_left(reason)
  sum by (pod, reason) (
    max without(instance, job, endpoint, service, prometheus, uid) (
      kube_pod_container_status_last_terminated_reason{container="${containerName}"}
    )
  )
)
`

const queryK8sEvent = (serviceId: string, dynamicRange: string) => `
  sum by (pod,reason)(
  (
    k8s_event_logger_q_k8s_events_total{
      qovery_com_service_id="${serviceId}",
      reason=~"Failed|OOMKilled|BackOff|Evicted|FailedScheduling|FailedMount|FailedAttachVolume|Preempted|NodeNotReady"
    }
    -
    k8s_event_logger_q_k8s_events_total{
      qovery_com_service_id="${serviceId}",
      reason=~"Failed|OOMKilled|BackOff|Evicted|FailedScheduling|FailedMount|FailedAttachVolume|Preempted|NodeNotReady"
    } offset ${dynamicRange}
  ) > 0
)
`

const queryMinReplicas = (containerName: string) => `
  max by(label_qovery_com_service_id)(kube_horizontalpodautoscaler_spec_min_replicas{horizontalpodautoscaler="${containerName}"})
`

const queryMaxReplicas = (containerName: string) => `
  max by(label_qovery_com_service_id)(kube_horizontalpodautoscaler_spec_max_replicas{horizontalpodautoscaler="${containerName}"})
`

const queryMaxLimitReached = (serviceId: string, rateInterval: string) => `
  sum by (label_qovery_com_service_id) (
  increase(
    kube_horizontalpodautoscaler_status_condition{
      condition="ScalingLimited",
      status="true"
    }[${rateInterval}]
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
      label_qovery_com_service_id="${serviceId}"
    }
  ) > 0
)
`

const getDescriptionFromReason = (reason: string): string => {
  switch (reason) {
    case 'OOMKilled':
      return 'Container killed due to out-of-memory.'
    case 'Error':
      return 'Container exited with non-zero exit code.'
    case 'Completed':
      return 'Container completed successfully with exit code 0.'
    default:
      return 'Unknown'
  }
}

const getDescriptionFromK8sEvent = (reason: string): string => {
  switch (reason) {
    case 'OOMKilled':
      return 'Container was killed because it exceeded its memory limit (Out-Of-Memory).'
    case 'Failed':
      return 'Pod or container failed to start or run.'
    case 'BackOff':
      return 'Container restart is being delayed due to repeated failures (CrashLoopBackOff or image-pull back-off).'
    case 'Evicted':
      return 'Pod was evicted from the node due to resource pressure or eviction policy.'
    case 'FailedScheduling':
      return 'Scheduler could not place the pod on any node (resource constraints or node selectors).'
    case 'FailedMount':
      return 'Kubernetes could not mount one or more volumes required by the pod.'
    case 'FailedAttachVolume':
      return 'Kubernetes could not attach a volume to the node for this pod.'
    case 'Preempted':
      return 'Pod was pre-empted by another higher-priority pod.'
    case 'NodeNotReady':
      return 'The node hosting the pod became NotReady.'
    default:
      return 'Unknown'
  }
}

// TODO: keep it for now, but we should improve it
const getExitCodeInfo = (exitCode: string): { name: string; description: string } => {
  const code = parseInt(exitCode, 10)

  switch (code) {
    case 0:
      return {
        name: exitCode + ': Purposely stopped',
        description: 'Used by developers to indicate that the container was automatically stopped.',
      }
    case 1:
      return {
        name: exitCode + ': Application error',
        description:
          'Container was stopped due to application error or incorrect reference in the image specification.',
      }
    case 125:
      return {
        name: exitCode + ': Container failed to run error',
        description: 'The docker run command did not execute successfully.',
      }
    case 126:
      return {
        name: exitCode + ': Command invoke error',
        description: 'A command specified in the image specification could not be invoked.',
      }
    case 127:
      return {
        name: exitCode + ': File or directory not found',
        description: 'File or directory specified in the image specification was not found.',
      }
    case 128:
      return {
        name: exitCode + ': Invalid argument used on exit',
        description: 'Exit was triggered with an invalid exit code (valid codes are integers between 0-255).',
      }
    case 134:
      return {
        name: exitCode + ': Abnormal termination (SIGABRT)',
        description: 'The container aborted itself using the abort() function.',
      }
    case 137:
      return {
        name: exitCode + ': Immediate termination (SIGKILL)',
        description: 'Container was immediately terminated by the operating system via SIGKILL signal.',
      }
    case 139:
      return {
        name: exitCode + ': Segmentation fault (SIGSEGV)',
        description: 'Container attempted to access memory that was not assigned to it and was terminated.',
      }
    case 143:
      return {
        name: exitCode + ': Graceful termination (SIGTERM)',
        description: 'Container received warning that it was about to be terminated, then terminated.',
      }
    case 255:
      return {
        name: exitCode + ': Exit Status Out Of Range',
        description:
          'Container exited, returning an exit code outside the acceptable range, meaning the cause of the error is not known.',
      }
    default:
      return {
        name: `Exit Code ${exitCode}`,
        description: 'Unknown exit code.',
      }
  }
}

export function InstanceStatusChart({
  clusterId,
  serviceId,
  containerName,
  isFullscreen,
}: {
  clusterId: string
  serviceId: string
  containerName: string
  isFullscreen?: boolean
}) {
  const { startTimestamp, endTimestamp, useLocalTime, hideEvents, timeRange } = useServiceOverviewContext()

  // Calculate dynamic range based on time range
  const dynamicRange = useMemo(
    () => calculateDynamicRange(startTimestamp, endTimestamp, 1),
    [startTimestamp, endTimestamp]
  )

  const rateInterval = useMemo(
    () => calculateRateInterval(startTimestamp, endTimestamp),
    [startTimestamp, endTimestamp]
  )

  const intervalForEvent = useMemo(() => {
    const startMs = Number(startTimestamp) * 1000
    const endMs = Number(endTimestamp) * 1000
    const durationMs = endMs - startMs

    if (durationMs < 24 * 60 * 60 * 1000) {
      return '1m'
    } else if (durationMs <= 7 * 24 * 60 * 60 * 1000) {
      return '10m'
    } else {
      return '6h'
    }
  }, [startTimestamp, endTimestamp])

  const intervalForEventInSec = useMemo(() => {
    const startMs = Number(startTimestamp) * 1000
    const endMs = Number(endTimestamp) * 1000
    const durationMs = endMs - startMs

    if (durationMs < 24 * 60 * 60 * 1000) {
      return 60
    } else if (durationMs <= 7 * 24 * 60 * 60 * 1000) {
      return 10 * 60
    } else {
      return 6 * 60 * 60
    }
  }, [startTimestamp, endTimestamp])

  const { data: metricsUnhealthy, isLoading: isLoadingUnhealthy } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryUnhealthyPods(serviceId),
  })

  const { data: metricsHealthy, isLoading: isLoadingHealthy } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryHealthyPods(serviceId),
  })

  const { data: metricsRestartsWithReason, isLoading: isLoadingMetricsRestartsWithReason } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryRestartWithReason(containerName, timeRange),
    overriddenStep: intervalForEvent, // TODO PG check if necessary
    overriddenResolution: '0s', // TODO PG check if necessary
  })

  const { data: metricsK8sEvent, isLoading: isLoadingMetricsK8sEvent } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryK8sEvent(serviceId, dynamicRange),
  })

  const { data: metricsHpaMinReplicas, isLoading: isLoadingHpaMinReplicas } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryMinReplicas(containerName),
    timeRange,
  })

  const { data: metricsHpaMaxReplicas, isLoading: isLoadingHpaMaxReplicas } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryMaxReplicas(containerName),
    timeRange,
  })

  const { data: metricsHpaMaxLimitReached, isLoading: isLoadingHpaMaxLimitReached } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryMaxLimitReached(serviceId, rateInterval),
    timeRange,
  })

  const chartData = useMemo(() => {
    // Merge healthy and unhealthy metrics into a single timeSeriesMap
    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process unhealthy
    if (metricsUnhealthy?.data?.result) {
      processMetricsData(
        metricsUnhealthy,
        timeSeriesMap,
        () => 'Instance unhealthy',
        (value) => parseFloat(value),
        useLocalTime
      )
    }
    // Process healthy
    if (metricsHealthy?.data?.result) {
      processMetricsData(
        metricsHealthy,
        timeSeriesMap,
        () => 'Instance healthy',
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
    metricsUnhealthy,
    metricsHealthy,
    useLocalTime,
    startTimestamp,
    endTimestamp,
    metricsHpaMinReplicas,
    metricsHpaMaxReplicas,
  ])

  const referenceLineData = useMemo(() => {
    if (
      !metricsRestartsWithReason?.data?.result &&
      !metricsK8sEvent?.data?.result &&
      !metricsHpaMaxLimitReached?.data?.result
    )
      return []

    const referenceLines: ReferenceLineEvent[] = []

    // Add metric-based reference lines
    if (metricsRestartsWithReason?.data?.result) {
      metricsRestartsWithReason.data.result.forEach(
        (series: { metric: { reason: string }; values: [number, string][] }) => {
          let prevValue: number | null = null
          let prevTime = 0

          series.values.forEach(([timestamp, value]: [number, string]) => {
            const numValue = Math.floor(parseFloat(value))
            const currentTime = timestamp

            if (numValue > 0 && (numValue !== prevValue || currentTime - prevTime > 3 * intervalForEventInSec)) {
              if (currentTime - prevTime > 3 * intervalForEventInSec) {
                prevValue = 0
              }

              const count = Math.abs(numValue - (prevValue || 0))
              const key = `${series.metric.reason}-${timestamp}`
              referenceLines.push({
                type: 'metric',
                timestamp: timestamp * 1000,
                reason:
                  count > 1
                    ? (series.metric['reason'] || 'unknown') + ` (${count} times)`
                    : series.metric['reason'] || 'unknown',
                description: getDescriptionFromReason(series.metric.reason),
                icon: series.metric.reason === 'Completed' ? 'check' : 'newspaper',
                color: series.metric.reason === 'Completed' ? 'var(--color-yellow-600)' : 'var(--color-red-500)',
                key,
              })
            }
            prevValue = numValue
            prevTime = currentTime
          })
        }
      )
    }

    // Add k8s event as reference lines
    if (metricsK8sEvent?.data?.result) {
      metricsK8sEvent.data.result.forEach(
        (series: { metric: { reason: string; pod: string }; values: [number, string][] }) => {
          series.values.forEach(([timestamp, value]: [number, string]) => {
            const numValue = parseFloat(value)
            if (numValue > 0) {
              const key = `${series.metric.reason}-${timestamp}`
              referenceLines.push({
                type: 'k8s-event',
                timestamp: timestamp * 1000,
                reason: series.metric.reason,
                description: getDescriptionFromK8sEvent(series.metric.reason),
                icon: 'xmark',
                color: 'var(--color-red-500)',
                pod: series.metric.pod,
                key,
              })
            }
          })
        }
      )
    }

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
                color: 'var(--color-red-500)',
                icon: 'exclamation',
                pod: series.metric.pod,
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
  }, [metricsK8sEvent, metricsHpaMaxLimitReached, metricsRestartsWithReason, intervalForEventInSec])

  const isLoading = useMemo(
    () =>
      isLoadingUnhealthy ||
      isLoadingHealthy ||
      isLoadingMetricsRestartsWithReason ||
      isLoadingMetricsK8sEvent ||
      isLoadingHpaMinReplicas ||
      isLoadingHpaMaxReplicas ||
      isLoadingHpaMaxLimitReached,
    [
      isLoadingUnhealthy,
      isLoadingHealthy,
      isLoadingMetricsRestartsWithReason,
      isLoadingMetricsK8sEvent,
      isLoadingHpaMinReplicas,
      isLoadingHpaMaxReplicas,
      isLoadingHpaMaxLimitReached,
    ]
  )

  return (
    <LocalChart
      data={chartData || []}
      isLoading={isLoading}
      isEmpty={(chartData || []).length === 0}
      tooltipLabel="Instance issues"
      unit="instance"
      serviceId={serviceId}
      yDomain={[0, 'dataMax + 1']}
      referenceLineData={referenceLineData}
      isFullscreen={isFullscreen}
    >
      <Area
        key="true"
        dataKey="Instance healthy"
        stroke="var(--color-green-500)"
        fill="var(--color-green-500)"
        fillOpacity={0.3}
        isAnimationActive={false}
        dot={false}
        strokeWidth={2}
        stackId="status"
      />
      <Area
        key="false"
        dataKey="Instance unhealthy"
        stroke="var(--color-red-500)"
        fill="var(--color-red-500)"
        fillOpacity={0.3}
        isAnimationActive={false}
        dot={false}
        strokeWidth={2}
        stackId="status"
      />
      <Line
        key="min"
        dataKey="Autoscaling min replicas"
        type="linear"
        stroke="var(--color-neutral-300)"
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
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />
      {!hideEvents && (
        <>
          {referenceLineData
            .filter((event) => event.type === 'event')
            .map((event) => (
              <ReferenceLine
                key={event.key}
                name={event.key}
                x={event.timestamp}
                stroke={event.color}
                strokeDasharray="3 3"
                opacity={0.4}
                strokeWidth={2}
                onMouseEnter={() => {
                  const referenceLine = document.querySelectorAll(
                    `line[name="${event.key}"].recharts-reference-line-line`
                  )
                  referenceLine.forEach((line) => {
                    line.classList.add('active')
                  })
                }}
                onMouseLeave={() => {
                  const referenceLine = document.querySelectorAll(
                    `line[name="${event.key}"].recharts-reference-line-line`
                  )
                  referenceLine.forEach((line) => {
                    line.classList.remove('active')
                  })
                }}
                label={{
                  value: event.reason,
                  position: 'top',
                  fill: event.color,
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              />
            ))}
          {referenceLineData
            .filter(
              (event) =>
                event.type === 'exit-code' ||
                event.type === 'metric' ||
                event.type === 'k8s-event' ||
                event.type === 'probe'
            )
            .map((event) => (
              <ReferenceLine
                key={event.key}
                name={event.key}
                x={event.timestamp}
                stroke={event.color}
                strokeDasharray="3 3"
                opacity={0.4}
                strokeWidth={2}
                onMouseEnter={() => {
                  const referenceLine = document.querySelectorAll(
                    `line[name="${event.key}"].recharts-reference-line-line`
                  )
                  referenceLine.forEach((line) => {
                    line.classList.add('active')
                  })
                }}
                onMouseLeave={() => {
                  const referenceLine = document.querySelectorAll(
                    `line[name="${event.key}"].recharts-reference-line-line`
                  )
                  referenceLine.forEach((line) => {
                    line.classList.remove('active')
                  })
                }}
                label={{
                  value: event.reason,
                  position: 'top',
                  fill: event.color,
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

export default InstanceStatusChart
