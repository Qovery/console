import { useMemo } from 'react'
import { Area, ReferenceLine } from 'recharts'
import { calculateDynamicRange, useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart, type ReferenceLineEvent } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

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

export const getDescriptionFromProbeType = (probeType: string): string => {
  switch (probeType.toLowerCase()) {
    case 'readiness':
      return 'Readiness probe failed: the container is not ready to receive traffic.'
    case 'liveness':
      return 'Liveness probe failed: Kubernetes will restart the container.'
    case 'startup':
      return 'Startup probe failed: the container did not finish its startup sequence in time.'
    default:
      return 'Unknown probe type'
  }
}

export const getDescriptionFromK8sEvent = (reason: string): string => {
  switch (reason) {
    case 'OOMKilled':
      return 'Container was killed because it exceeded its memory limit (Out-Of-Memory).'
    case 'Failed':
      return 'Pod or container failed to start or run.'
    case 'BackOff':
      return 'Container restart is being delayed due to repeated failures (CrashLoopBackOff or image-pull back-off).'
    case 'Unhealthy':
      return 'Container reported as unhealthy after failing its health checks.'
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

const getExitCodeInfo = (exitCode: string): { name: string; description: string } => {
  const code = parseInt(exitCode, 10)

  switch (code) {
    case 0:
      return {
        name: 'Purposely stopped',
        description: 'Used by developers to indicate that the container was automatically stopped.',
      }
    case 1:
      return {
        name: 'Application error',
        description:
          'Container was stopped due to application error or incorrect reference in the image specification.',
      }
    case 125:
      return {
        name: 'Container failed to run error',
        description: 'The docker run command did not execute successfully.',
      }
    case 126:
      return {
        name: 'Command invoke error',
        description: 'A command specified in the image specification could not be invoked.',
      }
    case 127:
      return {
        name: 'File or directory not found',
        description: 'File or directory specified in the image specification was not found.',
      }
    case 128:
      return {
        name: 'Invalid argument used on exit',
        description: 'Exit was triggered with an invalid exit code (valid codes are integers between 0-255).',
      }
    case 134:
      return {
        name: 'Abnormal termination (SIGABRT)',
        description: 'The container aborted itself using the abort() function.',
      }
    case 137:
      return {
        name: 'Immediate termination (SIGKILL)',
        description: 'Container was immediately terminated by the operating system via SIGKILL signal.',
      }
    case 139:
      return {
        name: 'Segmentation fault (SIGSEGV)',
        description: 'Container attempted to access memory that was not assigned to it and was terminated.',
      }
    case 143:
      return {
        name: 'Graceful termination (SIGTERM)',
        description: 'Container received warning that it was about to be terminated, then terminated.',
      }
    case 255:
      return {
        name: 'Exit Status Out Of Range',
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

export function InstanceStatusChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const { startTimestamp, endTimestamp, useLocalTime, hideEvents, hoveredEventKey, setHoveredEventKey, timeRange } =
    useServiceOverviewContext()

  // Calculate dynamic range based on time range
  const dynamicRange = useMemo(
    () => calculateDynamicRange(startTimestamp, endTimestamp, 1),
    [startTimestamp, endTimestamp]
  )

  const { data: metricsUnhealthy, isLoading: isLoadingUnhealthy } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: `sum by (condition)(kube_pod_status_ready{condition=~"false"}
    * on(namespace,pod) group_left(label_qovery_com_service_id)
      max by(namespace,pod,label_qovery_com_service_id)(
        kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}
      )) > 0`,
  })

  const { data: metricsHealthy, isLoading: isLoadingHealthy } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: `sum by (condition)(kube_pod_status_ready{condition=~"true"}
    * on(namespace,pod) group_left(label_qovery_com_service_id)
      max by(namespace,pod,label_qovery_com_service_id)(
        kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}
      )) > 0`,
  })

  const { data: metricsReason, isLoading: isLoadingMetricsReason } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: `
  sum by (pod, reason) (
    (
      kube_pod_container_status_last_terminated_reason{} == 1
    )
    * on(namespace, pod) group_left(label_qovery_com_service_id)
      max by(namespace, pod, label_qovery_com_service_id) (
        kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}
      )
    unless on(namespace, pod, reason)
    (
      (
        kube_pod_container_status_last_terminated_reason{} offset ${dynamicRange} == 1
      )
      * on(namespace, pod) group_left(label_qovery_com_service_id)
        max by(namespace, pod, label_qovery_com_service_id) (
          kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}
        )
    )
  )`,
  })

  const { data: metricsExitCode, isLoading: isLoadingMetricsExitCode } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: `
  (
    kube_pod_container_status_last_terminated_exitcode
    * on(namespace, pod) group_left(label_qovery_com_service_id)
      max by(namespace, pod, label_qovery_com_service_id) (
        kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}
      )
  )
  and on(namespace, pod, container)
  (
    kube_pod_container_status_restarts_total
    >
    kube_pod_container_status_restarts_total offset ${dynamicRange}
  )
`,
  })

  const { data: metricsK8sEvent, isLoading: isLoadingMetricsK8sEvent } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: `
  sum by (pod,reason)(
  (
    k8s_event_logger_q_k8s_events_total{
      qovery_com_service_id=~"${serviceId}",
      reason=~"Failed|OOMKilled|BackOff|Unhealthy|Evicted|FailedScheduling|FailedMount|FailedAttachVolume|Preempted|NodeNotReady"
    }
    -
    k8s_event_logger_q_k8s_events_total{
      qovery_com_service_id=~"${serviceId}",
      reason=~"Failed|OOMKilled|BackOff|Unhealthy|Evicted|FailedScheduling|FailedMount|FailedAttachVolume|Preempted|NodeNotReady"
    } offset ${dynamicRange}
  ) > 0
)
`,
  })

  const { data: metricsProbe, isLoading: isLoadingMetricsProbe } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: `
 sum by (probe_type) (   increase(
      prober_probe_total{result!="successful", probe_type="Readiness"}[1m]
    )
    * on(namespace,pod) group_left(label_qovery_com_service_id)
      max by(namespace,pod,label_qovery_com_service_id)(
        kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}
      )
      )
`,
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

    // Convert map to sorted array and add time range padding
    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)
    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metricsUnhealthy, metricsHealthy, useLocalTime, startTimestamp, endTimestamp])

  const referenceLineData = useMemo(() => {
    if (
      !metricsReason?.data?.result &&
      !metricsExitCode?.data?.result &&
      !metricsK8sEvent?.data?.result &&
      !metricsProbe?.data?.result
    )
      return []

    const referenceLines: ReferenceLineEvent[] = []

    // Add metric-based reference lines
    if (metricsReason?.data?.result) {
      metricsReason.data.result.forEach(
        (series: { metric: { reason: string; pod: string }; values: [number, string][] }) => {
          series.values.forEach(([timestamp, value]: [number, string]) => {
            const numValue = parseFloat(value)
            if (numValue > 0) {
              const key = `${series.metric.reason}-${timestamp}`
              referenceLines.push({
                type: 'metric',
                timestamp: timestamp * 1000,
                reason: series.metric.reason,
                description: getDescriptionFromReason(series.metric.reason),
                icon: series.metric.reason === 'Completed' ? 'check' : 'newspaper',
                color: series.metric.reason === 'Completed' ? 'var(--color-yellow-500)' : 'var(--color-red-500)',
                key,
              })
            }
          })
        }
      )
    }

    // Add exit code as reference lines
    if (metricsExitCode?.data?.result) {
      metricsExitCode.data.result.forEach((series: { metric: { pod: string }; values: [number, string][] }) => {
        series.values.forEach(([timestamp, value]: [number, string]) => {
          const numValue = parseFloat(value)
          if (numValue >= 0) {
            const key = `${series.metric.pod}-${timestamp}`
            const exitCodeInfo = getExitCodeInfo(series.values[0][1])
            referenceLines.push({
              type: 'exit-code',
              timestamp: timestamp * 1000,
              reason: exitCodeInfo.name,
              description: exitCodeInfo.description,
              icon: 'exclamation',
              key,
            })
          }
        })
      })
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
                key,
              })
            }
          })
        }
      )
    }

    // Add probe event as reference lines
    if (metricsProbe?.data?.result) {
      metricsProbe.data.result.forEach(
        (series: { metric: { probe_type: string; pod: string }; values: [number, string][] }) => {
          series.values.forEach(([timestamp, value]: [number, string]) => {
            const numValue = parseFloat(value)
            if (numValue > 0) {
              const key = `${series.metric.probe_type}-${timestamp}`
              referenceLines.push({
                type: 'probe',
                timestamp: timestamp * 1000,
                reason: series.metric.probe_type,
                description: getDescriptionFromProbeType(series.metric.probe_type),
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
  }, [metricsReason, metricsExitCode, metricsK8sEvent, metricsProbe])

  return (
    <LocalChart
      data={chartData || []}
      isLoading={
        isLoadingUnhealthy ||
        isLoadingHealthy ||
        isLoadingMetricsReason ||
        isLoadingMetricsExitCode ||
        isLoadingMetricsK8sEvent ||
        isLoadingMetricsProbe
      }
      isEmpty={(chartData || []).length === 0}
      tooltipLabel="Instance issues"
      unit="instance"
      serviceId={serviceId}
      margin={{ top: 14, bottom: 0, left: 0, right: 0 }}
      yDomain={[0, 'dataMax + 1']}
      referenceLineData={referenceLineData}
      isFullscreen
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
      {!hideEvents && (
        <>
          {referenceLineData
            .filter((event) => event.type === 'event')
            .map((event) => (
              <ReferenceLine
                key={event.key}
                x={event.timestamp}
                stroke="var(--color-brand-500)"
                strokeDasharray="3 3"
                opacity={hoveredEventKey === event.key ? 1 : 0.3}
                strokeWidth={2}
                onMouseEnter={() => setHoveredEventKey(event.key)}
                onMouseLeave={() => setHoveredEventKey(null)}
                label={{
                  value: hoveredEventKey === event.key ? event.reason : undefined,
                  position: 'top',
                  fill: 'var(--color-brand-500)',
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

export default InstanceStatusChart
