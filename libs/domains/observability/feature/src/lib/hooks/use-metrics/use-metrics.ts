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
  startTimestamp: string
  endTimestamp: string
  queryRange?: 'query' | 'query_range'
}

export function useMetrics({
  clusterId,
  query,
  startTimestamp,
  endTimestamp,
  queryRange = 'query_range',
}: UseMetricsProps) {
  let step: string | undefined
  const start =
    typeof startTimestamp === 'string' && !isNaN(Number(startTimestamp))
      ? Number(startTimestamp) * 1000
      : new Date(startTimestamp).getTime()
  const end =
    typeof endTimestamp === 'string' && !isNaN(Number(endTimestamp))
      ? Number(endTimestamp) * 1000
      : new Date(endTimestamp).getTime()

  if (!isNaN(start) && !isNaN(end) && end > start) {
    const durationInSeconds = (end - start) / 1000
    // 6h (21600s) = 86 step, 2h (7200s) = 28 step
    // This gives us approximately 250 seconds per step
    const calculatedStep = Math.max(Math.round(durationInSeconds / 250), 1)
    step = calculatedStep.toString()
  }

  return useQuery({
    ...observability.observability({ clusterId, query, queryRange, startTimestamp, endTimestamp, step }),
  })
}
