import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { observability } from '@qovery/domains/observability/data-access'
import { useServiceOverviewContext } from '../../service-overview/util-filter/service-overview-context'
import { type TimeRangeOption } from '../../service-overview/util-filter/time-range'
import { alignEndSec, alignStartSec } from './align-timestamp'
import { alignedRangeInMinutes } from './grafana-util'

export interface MetricData {
  metric: {
    container: string
    cpu: string
    endpoint: string
    id: string
    image: string
    instance: string
    job: string
    metrics_path: string
    name: string
    namespace: string
    node: string
    pod: string
    prometheus: string
    service: string
    reason?: string
  }
  values: [number, string][]
}

interface UseMetricsProps {
  clusterId: string
  query: string
  startTimestamp?: string
  endTimestamp?: string
  timeRange?: TimeRangeOption
  isLiveUpdateEnabled?: boolean
  overriddenResolution?: string
  overriddenMaxPoints?: number
  boardShortName: 'service_overview'
  metricShortName: string
}

function useLiveUpdateSetting(): boolean {
  const context = useServiceOverviewContext()
  // Pause live updates when charts are zoomed or when the date picker is open
  return context.isLiveUpdateEnabled && !context.isAnyChartZoomed && !context.isDatePickerOpen
}

// Simple wrapper that automatically applies live update toggle from context
export function useMetrics({
  clusterId,
  query,
  startTimestamp,
  endTimestamp,
  timeRange,
  isLiveUpdateEnabled: overrideLiveUpdate,
  overriddenResolution,
  overriddenMaxPoints,
  boardShortName,
  metricShortName,
}: UseMetricsProps) {
  // Get context and live update setting, but allow override
  const context = useServiceOverviewContext()
  const contextLiveUpdate = useLiveUpdateSetting()
  const finalLiveUpdateEnabled = overrideLiveUpdate ?? contextLiveUpdate

  const alignedStart = alignStartSec(startTimestamp)
  const alignedEnd = alignEndSec(endTimestamp)
  const alignedRange = alignedRangeInMinutes(alignedStart, alignedEnd)

  const step = useMemo(() => {
    // Actual scrape_interval = 30s
    // https://prometheus.io/docs/prometheus/latest/configuration/configuration/#duration
    // https://qovery.slack.com/archives/C02NQ0LC8M9/p1753804730631609?thread_ts=1753803872.246399&cid=C02NQ0LC8M9
    if (timeRange === '5m') return '30000ms' // 30 seconds (match actual scrape_interval)
    if (timeRange === '15m') return '60000ms' // 1 minute for longer ranges (2x scrape_interval)
    if (timeRange === '30m') return '120000ms' // 2 minutes for longer ranges (4x scrape_interval)
    if (alignedStart && alignedEnd) {
      return calculateDynamicRange(alignedStart, alignedEnd, overriddenMaxPoints)
    }
    return '30000ms' // Default: 30 seconds (match actual scrape_interval)
  }, [timeRange, alignedStart, alignedEnd, overriddenMaxPoints])

  const maxSourceResolution = useMemo(() => {
    if (overriddenResolution !== undefined) {
      return overriddenResolution ?? ('0s' as const)
    }
    if (!alignedStart || !alignedEnd) return '0s' as const
    const safeStep = step ?? '1m'
    return calculateMaxSourceResolution(alignedStart, alignedEnd, safeStep)
  }, [alignedStart, alignedEnd, step, overriddenResolution])

  const queryResult = useQuery({
    ...observability.metrics({
      clusterId,
      query,
      queryRange: 'query_range',
      startTimestamp: alignedStart,
      endTimestamp: alignedEnd,
      timeRange,
      step,
      maxSourceResolution,
      // These params are used to generate charts in Grafana
      boardShortName,
      metricShortName,
      traceId: 'na',
      alignedRange,
    }),
    keepPreviousData: true,
    refetchInterval: finalLiveUpdateEnabled ? 30_000 : false, // Refetch every 30 seconds only if live update is enabled
    refetchIntervalInBackground: finalLiveUpdateEnabled,
    refetchOnWindowFocus: false,
    retry: 3,
  })

  // Custom isLoading: true on first load and when timeRange changes, false on live refetch
  const lastTimeRange = useRef<TimeRangeOption | undefined>(timeRange)
  const [isLoadingCustom, setIsLoadingCustom] = useState(queryResult.isLoading)

  useEffect(() => {
    if (timeRange !== lastTimeRange.current) {
      setIsLoadingCustom(true)
      lastTimeRange.current = timeRange
    }
  }, [timeRange])

  useEffect(() => {
    if (!queryResult.isFetching) {
      setIsLoadingCustom(false)
    }
  }, [queryResult.isFetching])

  // isRefreshing: true when fetching data but not on initial load or time range changes
  const isRefreshing = queryResult.isFetching && !isLoadingCustom

  // Track refreshing state at global level through context
  const previousIsRefreshing = useRef(false)
  useEffect(() => {
    if (context && previousIsRefreshing.current !== isRefreshing) {
      // Increment counter when starting to refresh, decrement when stopping
      context.setIsAnyChartRefreshing(isRefreshing)
      previousIsRefreshing.current = isRefreshing
    }
  }, [context, isRefreshing])

  return {
    ...queryResult,
    isLoading: isLoadingCustom,
    isRefreshing,
    stepInSecond: promDurationToMs(step) / 1000,
  }
}

// Grafana-like auto rate interval
export function calculateRateInterval(startTimestamp: string, endTimestamp: string): string {
  const startMs = Number(startTimestamp) * 1000
  const endMs = Number(endTimestamp) * 1000
  const durationMs = endMs - startMs

  // Defaults
  const scrapeIntervalMs = 15_000 // 15s Prom scrape interval
  const targetPoints = 200

  // Allowed rate windows (Grafana-like buckets)
  const allowedStepsMs = [
    60_000, // 1m
    5 * 60_000, // 5m
    15 * 60_000, // 15m
    30 * 60_000, // 30m
    60 * 60_000, // 1h
    2 * 60 * 60_000, // 2h
    6 * 60 * 60_000, // 6h
    12 * 60 * 60_000, // 12h
  ] as const

  // Minimum = 4× scrape interval (avoid jitter)
  const minWindowMs = Math.max(4 * scrapeIntervalMs, allowedStepsMs[0])

  // Ideal = range ÷ targetPoints
  const desiredMs = Math.max(minWindowMs, Math.ceil(durationMs / targetPoints))

  // Pick the closest allowed step >= desired
  const pickedMs = allowedStepsMs.find((s) => s >= desiredMs) ?? allowedStepsMs[allowedStepsMs.length - 1]

  function msToPromDuration(ms: number): string {
    if (ms % (60 * 60 * 1000) === 0) return `${ms / (60 * 60 * 1000)}h`
    if (ms % (60 * 1000) === 0) return `${ms / (60 * 1000)}m`
    if (ms % 1000 === 0) return `${ms / 1000}s`
    return `${ms}ms`
  }

  return msToPromDuration(pickedMs)
}

/**
 * Calculate a Prometheus/Thanos query step.
 *
 * Same API as before:
 *   - startTimestamp, endTimestamp in seconds (string)
 *   - offsetMultiplier in 30s units (optional)
 *   - overriddenMaxPoints = target number of points (default 150)
 *
 * Returns: "<N>ms"
 */
export function calculateDynamicRange(
  startTimestamp: string,
  endTimestamp: string,
  offsetMultiplier = 0,
  overriddenMaxPoints = 150
): string {
  const startMs = Number(startTimestamp) * 1000
  const endMs = Number(endTimestamp) * 1000
  const durationMs = Math.max(0, endMs - startMs)

  // Allowed, quantized step values (ms)
  const allowedStepsMs = [
    30_000, // 30s
    60_000, // 1m
    120_000, // 2m
    300_000, // 5m
    600_000, // 10m
    900_000, // 15m
    1_800_000, // 30m
    3_600_000, // 1h
    7_200_000, // 2h
    10_800_000, // 3h
    21_600_000, // 6h
  ] as const

  // Minimal step based on range / maxPoints
  const rawStep = Math.ceil(durationMs / Math.max(1, overriddenMaxPoints))

  // Snap to grid upwards
  const snapped = allowedStepsMs.find((s) => s >= rawStep) ?? allowedStepsMs[allowedStepsMs.length - 1]

  // Apply jitter: each unit = 30s
  const jitter = offsetMultiplier * 30_000

  // Clamp jitter to ±20% of snapped
  const maxJitter = snapped * 0.2
  const clamped = Math.max(-maxJitter, Math.min(jitter, maxJitter))

  // Final step: keep on grid by snapping up again
  const withJitter = snapped + clamped
  const finalStep = allowedStepsMs.find((s) => s >= withJitter) ?? allowedStepsMs[allowedStepsMs.length - 1]

  // console.log('PGPG calculateDynamicRange ', overriddenMaxPoints, finalStep)
  return `${finalStep}ms`
}

/**
 * Calculate Thanos max_source_resolution based on step and range.
 *
 * Same API as before:
 *   - startTimestamp, endTimestamp in seconds (string)
 *   - renderedStep string ("60000ms", "5m", etc.)
 *
 * Returns one of: "0s" | "5m" | "1h"
 */
export function calculateMaxSourceResolution(
  startTimestamp: string,
  endTimestamp: string,
  renderedStep: string
): '0s' | '5m' | '1h' {
  const stepMs = promDurationToMs(renderedStep)
  const startMs = Number(startTimestamp) * 1000
  const endMs = Number(endTimestamp) * 1000
  const rangeMs = Math.max(0, endMs - startMs)

  // By step (hysteresis thresholds)
  const RAW_BOUNDARY = 150_000 // 2m30s
  const ONE_H_BOUNDARY = 1_800_000 // 30m

  let byStep: '0s' | '5m' | '1h'
  if (stepMs < RAW_BOUNDARY) byStep = '0s'
  else if (stepMs < ONE_H_BOUNDARY) byStep = '5m'
  else byStep = '1h'

  // By range
  const TWELVE_H = 12 * 3_600_000
  const SEVEN_D = 7 * 24 * 3_600_000

  let byRange: '0s' | '5m' | '1h'
  if (rangeMs < TWELVE_H) byRange = '0s'
  else if (rangeMs <= SEVEN_D) byRange = '5m'
  else byRange = '1h'

  // Pick the coarser
  const order = ['0s', '5m', '1h'] as const
  return order[Math.max(order.indexOf(byStep), order.indexOf(byRange))]
}

// Parse duration string into ms
function promDurationToMs(d: string): number {
  const m = d.match(/^(\d+)(ms|s|m|h|d)$/)
  if (!m) return 60_000
  const n = Number(m[1])
  switch (m[2]) {
    case 'ms':
      return n
    case 's':
      return n * 1000
    case 'm':
      return n * 60_000
    case 'h':
      return n * 3_600_000
    case 'd':
      return n * 86_400_000
    default:
      return 60_000
  }
}
