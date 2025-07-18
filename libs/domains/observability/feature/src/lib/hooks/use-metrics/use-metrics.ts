import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

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
}

export function useMetrics({
  clusterId,
  query,
  startTimestamp,
  endTimestamp,
  queryRange = 'query_range',
}: UseMetricsProps) {
  let step = '15000ms'

  if (startTimestamp && endTimestamp) {
    step = calculateDynamicRange(startTimestamp, endTimestamp)
  }

  return useQuery({
    ...observability.observability({
      clusterId,
      query,
      queryRange,
      startTimestamp,
      endTimestamp,
      step,
    }),
  })
}

export function calculateDynamicRange(startTimestamp: string, endTimestamp: string): string {
  const startMs = Number(startTimestamp) * 1000
  const endMs = Number(endTimestamp) * 1000
  const durationMs = endMs - startMs
  let stepMs: number

  if (durationMs <= 12 * 60 * 60 * 1000) {
    // < 12h
    stepMs = 15000
  } else if (durationMs < 24 * 60 * 60 * 1000) {
    // < 24h
    stepMs = 30000
  } else if (durationMs < 48 * 60 * 60 * 1000) {
    // < 48h
    stepMs = 60000
  } else if (durationMs < 7 * 24 * 60 * 60 * 1000) {
    // < 7d
    stepMs = 120000
  } else if (durationMs < 30 * 24 * 60 * 60 * 1000) {
    // < 30d
    stepMs = 300000
  } else if (durationMs < 60 * 24 * 60 * 60 * 1000) {
    // < 60d
    stepMs = 1800000
  } else {
    stepMs = 7200000 // > 60d
  }

  return `${stepMs}ms`
}
