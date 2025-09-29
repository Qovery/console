import { useMemo } from 'react'
import { Area, Line, ReferenceArea, ReferenceLine } from 'recharts'
import { Label } from 'recharts'
import { calculateDynamicRange, useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart, type ReferenceLineEvent } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { formatTimestamp } from '../util-chart/format-timestamp'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryHealthyPods = (serviceId: string, namespace: string) => `
sum by (condition) (
  kube_pod_status_ready{condition=~"true|false", namespace="${namespace}"}
  and on (namespace, pod)
  kube_pod_labels{namespace="${namespace}", label_qovery_com_service_id="${serviceId}"}
)
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
      reason=~"Failed|OOMKilled|BackOff|Evicted|FailedScheduling|FailedMount|FailedAttachVolume|Preempted|NodeNotReady",
      type="Warning"
    }
    -
    k8s_event_logger_q_k8s_events_total{
      qovery_com_service_id="${serviceId}",
      reason=~"Failed|OOMKilled|BackOff|Evicted|FailedScheduling|FailedMount|FailedAttachVolume|Preempted|NodeNotReady",
       type="Warning"
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

const queryMaxLimitReached = (containerName: string) => `
 (
  kube_horizontalpodautoscaler_status_condition{
    condition="ScalingLimited", status="true",
    horizontalpodautoscaler="${containerName}"
  }
)
and on (namespace, horizontalpodautoscaler)
(
  kube_horizontalpodautoscaler_status_desired_replicas
  >= bool
  kube_horizontalpodautoscaler_spec_max_replicas
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
  namespace,
}: {
  clusterId: string
  serviceId: string
  containerName: string
  namespace: string
  isFullscreen?: boolean
}) {
  const { startTimestamp, endTimestamp, useLocalTime, hideEvents, timeRange } = useServiceOverviewContext()

  // Calculate dynamic range based on time range
  const dynamicRange = useMemo(
    () => calculateDynamicRange(startTimestamp, endTimestamp),
    [startTimestamp, endTimestamp]
  )

  const { data: metricsHealthy, isLoading: isLoadingHealthy } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryHealthyPods(serviceId, namespace),
    overriddenMaxPoints: 500,
    boardShortName: 'service_overview',
    metricShortName: 'instance_status_health',
  })

  const {
    data: metricsRestartsWithReason,
    isLoading: isLoadingMetricsRestartsWithReason,
    stepInSecond: metricsRestartsWithReasonStepInSec,
  } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryRestartWithReason(containerName, timeRange),
    boardShortName: 'service_overview',
    metricShortName: 'instance_status_restart',
  })

  const { data: metricsK8sEvent, isLoading: isLoadingMetricsK8sEvent } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryK8sEvent(serviceId, dynamicRange),
    boardShortName: 'service_overview',
    metricShortName: 'instance_status_k8s_event',
  })

  const { data: metricsHpaMinReplicas, isLoading: isLoadingHpaMinReplicas } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryMinReplicas(containerName),
    overriddenMaxPoints: 50,
    boardShortName: 'service_overview',
    metricShortName: 'instance_status_hpa_min',
  })

  const { data: metricsHpaMaxReplicas, isLoading: isLoadingHpaMaxReplicas } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryMaxReplicas(containerName),
    overriddenMaxPoints: 50,
    boardShortName: 'service_overview',
    metricShortName: 'instance_status_hpa_max',
  })

  const {
    data: metricsHpaMaxLimitReached,
    isLoading: isLoadingHpaMaxLimitReached,
    stepInSecond: metricsHpaMaxLimitStepInSec,
  } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryMaxLimitReached(containerName),
    boardShortName: 'service_overview',
    metricShortName: 'instance_status_hpa_limit_reached',
    overriddenMaxPoints: 500,
  })

  const referenceAreaData = useMemo(() => {
    if (!metricsHpaMaxLimitReached?.data?.result) return []

    const areas: Array<{
      x1: number
      x2: number
      midMs: number
      durationMs: number
      key: string
      label: string
    }> = []

    metricsHpaMaxLimitReached.data.result.forEach(
      (series: { metric: Record<string, string>; values: [number, string][] }, idx: number) => {
        const built = buildReferenceAreas(
          series.values,
          { minDurationSec: 60, prefix: `hpa-max-metricsHpaMaxLimitStepInSec${idx}` },
          metricsHpaMaxLimitStepInSec
        )
        built.forEach((a) => {
          areas.push({
            ...a,
            label: `ScalingLimited (${formatDuration(a.durationMs)})`,
          })
        })
      }
    )

    return areas
  }, [metricsHpaMaxLimitReached, metricsHpaMaxLimitStepInSec])

  const chartData = useMemo(() => {
    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process healthy and unhealthy instances
    if (metricsHealthy?.data?.result) {
      metricsHealthy.data.result.forEach(
        (serie: { metric: { condition: 'true' | 'false' }; values: [number, string][] }) => {
          const seriesName = serie.metric.condition === 'true' ? 'Instance healthy' : 'Instance unhealthy'

          serie.values.forEach(([timestamp, value]) => {
            const timestampNum = timestamp * 1000
            const { timeString, fullTimeString } = formatTimestamp(timestampNum, useLocalTime)

            if (!timeSeriesMap.has(timestampNum)) {
              timeSeriesMap.set(timestampNum, {
                timestamp: timestampNum,
                time: timeString,
                fullTime: fullTimeString,
              })
            }

            const dataPoint = timeSeriesMap.get(timestampNum)
            if (dataPoint) {
              const transformed = parseFloat(value)
              dataPoint[seriesName] = Number.isFinite(transformed) ? transformed : 0
            }
          })
        }
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
  }, [metricsHealthy, useLocalTime, startTimestamp, endTimestamp, metricsHpaMinReplicas, metricsHpaMaxReplicas])

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

            if (
              numValue > 0 &&
              (numValue !== prevValue || currentTime - prevTime > 3 * metricsRestartsWithReasonStepInSec)
            ) {
              if (currentTime - prevTime > 3 * metricsRestartsWithReasonStepInSec) {
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
    if (referenceAreaData) {
      referenceAreaData.forEach((a) => {
        const { fullTimeString: startStr } = formatTimestamp(a.x1, useLocalTime)
        const { fullTimeString: endStr } = formatTimestamp(a.x2, useLocalTime)

        // ici
        const evt = {
          type: 'hpa-area',
          timestamp: a.midMs,
          reason: 'ScalingLimited',
          description: `Autoscaling capped at max replicas from ${startStr} to ${endStr} (${formatDuration(a.durationMs)}).`,
          icon: 'exclamation',
          color: 'var(--color-red-500)',
          key: `${a.key}-event`,
        } satisfies ReferenceLineEvent

        referenceLines.push(evt)
      })
    }

    // Sort by timestamp ascending
    referenceLines.sort((a, b) => b.timestamp - a.timestamp)

    return referenceLines
  }, [
    metricsK8sEvent,
    metricsHpaMaxLimitReached,
    metricsRestartsWithReason,
    metricsRestartsWithReasonStepInSec,
    referenceAreaData,
    useLocalTime,
  ])

  const isLoading = useMemo(
    () =>
      isLoadingHealthy ||
      isLoadingMetricsRestartsWithReason ||
      isLoadingMetricsK8sEvent ||
      isLoadingHpaMinReplicas ||
      isLoadingHpaMaxReplicas ||
      isLoadingHpaMaxLimitReached,
    [
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
      {!hideEvents &&
        referenceAreaData.map((a) => (
          <ReferenceArea
            key={a.key}
            x1={a.x1}
            x2={a.x2}
            fill="var(--color-yellow-500)"
            fillOpacity={0.2}
            stroke="none"
            ifOverflow="extendDomain"
            label={
              <Label
                value={a.label}
                position="insideTopLeft" // insideTop | insideTopLeft | insideTopRight
                fill="var(--color-red-500)"
                fontSize={12}
                fontWeight="bold"
                dx={8}
                dy={8}
              />
            }
          />
        ))}

      {!hideEvents &&
        referenceAreaData.map((a) => (
          <ReferenceLine
            key={`${a.key}-label`}
            x={a.midMs}
            stroke="transparent"
            label={{
              value: a.label, // e.g. "ScalingLimited (25m00s)"
              position: 'top',
              fill: 'var(--color.red.500)',
              fontSize: 12,
              fontWeight: 'bold',
            }}
          />
        ))}

      <Area
        key="true"
        dataKey="Instance healthy"
        stroke="var(--color-green-500)"
        fill="var(--color-green-500)"
        fillOpacity={0.3}
        strokeWidth={0}
        isAnimationActive={false}
        dot={false}
        stackId="status"
      />
      <Area
        key="false"
        dataKey="Instance unhealthy"
        stroke="var(--color-red-500)"
        fill="var(--color-red-500)"
        fillOpacity={0.3}
        strokeWidth={0}
        isAnimationActive={false}
        dot={false}
        stackId="status"
      />
      <Line
        key="min"
        dataKey="Autoscaling min replicas"
        type="linear"
        stroke="var(--color-neutral-300)"
        strokeWidth={2}
        connectNulls={true}
        dot={false}
        isAnimationActive={false}
      />
      <Line
        key="max"
        dataKey="Autoscaling max replicas"
        type="linear"
        stroke="var(--color-red-500)"
        strokeWidth={2}
        connectNulls={true}
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

function buildReferenceAreas(
  values: Array<[number, string]>,
  opts: { minGapFactor?: number; minDurationSec?: number; joinGapSteps?: number; prefix?: string } = {},
  query_step_sec: number
) {
  // Normalize & guard
  if (!values || values.length === 0) return []

  // Sort defensively (Recharts / store should already be sorted, but let's be safe)
  const vals = [...values].sort((a, b) => a[0] - b[0])

  const stepSec = Math.max(1, Math.floor(query_step_sec)) // at least 1s
  const minGapSec = Math.max(stepSec + 1, Math.floor(stepSec * (opts.minGapFactor ?? 2)))
  const joinGapSec = Math.max(0, (opts.joinGapSteps ?? 1) * stepSec)

  type Area = { x1: number; x2: number; midMs: number; durationMs: number; key: string }
  const areas: Area[] = []

  let openStart: number | null = null // start of current ON area (sec)
  let offRunStart: number | null = null // start of a potential short OFF run (sec) inside an ON area
  let prevTs = vals[0][0] // previous sample ts (sec)

  const pushArea = (startSec: number, endSec: number) => {
    const durationSec = Math.max(0, endSec - startSec)
    if (opts.minDurationSec && durationSec < opts.minDurationSec) return

    const x1 = startSec * 1000
    const x2 = endSec * 1000
    const midMs = Math.round((x1 + x2) / 2)

    areas.push({
      x1,
      x2,
      midMs,
      durationMs: x2 - x1,
      key: `${opts.prefix ?? 'hpa-max'}-${startSec}-${endSec}`,
    })
  }

  for (let i = 0; i < vals.length; i++) {
    const tsSec = vals[i][0]
    const v = parseFloat(vals[i][1])
    const on = Number.isFinite(v) && v > 0

    // If there is a large sampling hole while an area is open → close the area.
    if (openStart !== null && tsSec - prevTs > minGapSec) {
      // close at the last "known good" boundary
      pushArea(openStart, prevTs + stepSec)
      openStart = null
      offRunStart = null
    }

    if (openStart === null) {
      // We are currently OFF
      if (on) {
        // OFF → ON : start a new area
        openStart = tsSec
        offRunStart = null
      }
    } else {
      // We are currently ON (area open)
      if (on) {
        // back ON → cancel any short OFF run that was in progress
        offRunStart = null
      } else {
        // we saw an OFF sample
        if (offRunStart === null) {
          // start of an OFF run inside an ON area
          offRunStart = tsSec
        }

        // If this OFF run is long enough, we close the area at the previous ON boundary
        if (tsSec - offRunStart >= joinGapSec) {
          // close at the last ON sample + step
          pushArea(openStart, prevTs + stepSec)
          openStart = null
          offRunStart = null
        }
      }
    }

    prevTs = tsSec
  }

  // Close trailing area (if still open). If we ended during a short OFF run, we still consider it ON.
  if (openStart !== null) {
    pushArea(openStart, prevTs + stepSec)
  }

  return areas
}

function formatDuration(ms: number) {
  // Very small helper to display "7m32s", "1h05m", etc.
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h) return `${h}h${String(m).padStart(2, '0')}m`
  if (m) return `${m}m${String(sec).padStart(2, '0')}s`
  return `${sec}s`
}

export default InstanceStatusChart
