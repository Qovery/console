import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { observability } from '@qovery/domains/observability/data-access'
import { useServiceOverviewContext } from '../../service-overview/util-filter/service-overview-context'
import { type TimeRangeOption } from '../../service-overview/util-filter/time-range'

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
  queryRange?: 'query' | 'query_range'
  timeRange?: TimeRangeOption
  isLiveUpdateEnabled?: boolean
}

// Helpers for alignment (timestamps in seconds)
// Needed to avoid issues with Prometheus when the time range is not aligned with the step interval
const ALIGN_SEC = 15
const alignStartSec = (ts?: string) => (ts == null ? undefined : Math.floor(Number(ts) / ALIGN_SEC) * ALIGN_SEC + '')
const alignEndSec = (ts?: string) => (ts == null ? undefined : Math.ceil(Number(ts) / ALIGN_SEC) * ALIGN_SEC + '')

// Helper hook to safely get live update setting from context
function useLiveUpdateSetting(): boolean {
  try {
    const context = useServiceOverviewContext()
    // Pause live updates when charts are zoomed or when the date picker is open
    return context.isLiveUpdateEnabled && !context.isAnyChartZoomed && !context.isDatePickerOpen
  } catch {
    // Context not available, default to true
    return true
  }
}

// Simple wrapper that automatically applies live update toggle from context
export function useMetrics({
  clusterId,
  query,
  startTimestamp,
  endTimestamp,
  queryRange = 'query_range',
  timeRange,
  isLiveUpdateEnabled: overrideLiveUpdate,
}: UseMetricsProps) {
  // Get live update setting from context, but allow override
  const contextLiveUpdate = useLiveUpdateSetting()
  const finalLiveUpdateEnabled = overrideLiveUpdate ?? contextLiveUpdate

  const alignedStart = alignStartSec(startTimestamp)
  const alignedEnd = alignEndSec(endTimestamp)

  const step = useMemo(() => {
    // TODO: Verify these step intervals match actual Prometheus scrape_interval configuration
    // Actual scrape_interval = 15s
    // https://prometheus.io/docs/prometheus/latest/configuration/configuration/#duration
    // https://qovery.slack.com/archives/C02NQ0LC8M9/p1753804730631609?thread_ts=1753803872.246399&cid=C02NQ0LC8M9
    if (timeRange === '5m') return '15000ms' // 15 seconds (match actual scrape_interval)
    if (timeRange === '15m') return '30000ms' // 30 seconds for longer ranges (2x scrape_interval)
    if (timeRange === '30m') return '60000ms' // 1 minute for longer ranges (4x scrape_interval)
    if (alignedStart && alignedEnd) {
      return calculateDynamicRange(alignedStart, alignedEnd)
    }
    return '15000ms' // Default: 15 seconds (match actual scrape_interval)
  }, [timeRange, alignedStart, alignedEnd])

  const maxSourceResolution = useMemo(() => {
    if (!alignedStart || !alignedEnd) return '0s' as const
    const safeStep = step ?? '1m'
    return calculateMaxSourceResolution(alignedStart, alignedEnd, safeStep)
  }, [alignedStart, alignedEnd, step])

  const queryResult = useQuery({
    ...observability.observability({
      clusterId,
      query,
      queryRange,
      startTimestamp: alignedStart,
      endTimestamp: alignedEnd,
      timeRange,
      step,
      maxSourceResolution,
    }),
    keepPreviousData: true,
    refetchInterval: finalLiveUpdateEnabled ? 15_000 : false, // Refetch every 15 seconds only if live update is enabled
    refetchIntervalInBackground: finalLiveUpdateEnabled,
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

  return {
    ...queryResult,
    isLoading: isLoadingCustom,
  }
}

export function calculateDynamicRange(startTimestamp: string, endTimestamp: string, offsetMultiplier = 0): string {
  const startMs = Number(startTimestamp) * 1000
  const endMs = Number(endTimestamp) * 1000
  const durationMs = endMs - startMs

  // Allowed, quantized step values (in ms) - expanded for longer time ranges
  const allowedStepsMs = [
    15000, // 15s
    30000, // 30s
    60000, // 1m
    120000, // 2m
    300000, // 5m
    600000, // 10m
    900000, // 15m
    1800000, // 30m
    3600000, // 1h
    7200000, // 2h
    10800000, // 3h - added for better 12h+ range optimization
    21600000, // 6h - added for better 24h+ range optimization
  ] as const

  // Cap points by escalating to the next quantized step until under target
  const MAX_POINTS_TARGET = 150

  // Minimal step to respect the max points target
  const minimalStepForCapMs = Math.ceil(durationMs / MAX_POINTS_TARGET)

  // Round up to the nearest allowed step
  const roundedStepMs =
    allowedStepsMs.find((step) => step >= minimalStepForCapMs) ?? allowedStepsMs[allowedStepsMs.length - 1]

  const finalStepMs = roundedStepMs + offsetMultiplier * 100

  return `${finalStepMs}ms`
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

// Max source resolution is max resolution in seconds we want to use for data we query for.
// https://thanos.io/v0.6/components/query/#auto-downsampling
export function calculateMaxSourceResolution(
  startTimestamp: string,
  endTimestamp: string,
  renderedStep: string
): string {
  const startMs = Number(startTimestamp) * 1000
  const endMs = Number(endTimestamp) * 1000
  const rangeMs = Math.max(0, endMs - startMs)

  function promDurationToMs(d: string): number {
    const m = d.match(/^(\d+)(ms|s|m|h|d)$/)
    if (!m) return 60_000 // fallback 1m
    const n = Number(m[1])
    switch (m[2]) {
      case 'ms':
        return n
      case 's':
        return n * 1_000
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

  const stepMs = promDurationToMs(renderedStep)

  let byStep: '0s' | '5m' | '1h'
  if (stepMs < 5 * 60_000) byStep = '0s'
  else if (stepMs < 60 * 60_000) byStep = '5m'
  else byStep = '1h'

  const twelveHoursMs = 12 * 60 * 60_000
  const sevenDaysMs = 7 * 24 * 60 * 60_000
  let byRange: '0s' | '5m' | '1h'
  if (rangeMs < twelveHoursMs) byRange = '0s'
  else if (rangeMs <= sevenDaysMs) byRange = '5m'
  else byRange = '1h'

  function coarserOf(a: '0s' | '5m' | '1h', b: '0s' | '5m' | '1h'): '0s' | '5m' | '1h' {
    const order = ['0s', '5m', '1h'] as const
    return order[Math.max(order.indexOf(a), order.indexOf(b))]
  }

  return coarserOf(byStep, byRange)
}
