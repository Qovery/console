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
  step?: string | number
}

export function useMetrics({
  clusterId,
  query,
  startTimestamp,
  endTimestamp,
  queryRange = 'query_range',
  step,
}: UseMetricsProps) {
  let calculatedStep: string | number | undefined

  if (step) {
    calculatedStep = step
  } else if (startTimestamp && endTimestamp) {
    const start =
      typeof startTimestamp === 'string' && !isNaN(Number(startTimestamp))
        ? Number(startTimestamp)
        : Math.floor(new Date(startTimestamp).getTime() / 1000)

    const end =
      typeof endTimestamp === 'string' && !isNaN(Number(endTimestamp))
        ? Number(endTimestamp)
        : Math.floor(new Date(endTimestamp).getTime() / 1000)

    if (!isNaN(start) && !isNaN(end) && end > start) {
      const durationInSeconds = end - start
      const durationInHours = durationInSeconds / 3600
      const durationInDays = durationInHours / 24

      // Calculate step based on duration
      if (durationInHours <= 12) {
        calculatedStep = '15' // 15 seconds
      } else if (durationInHours <= 24) {
        calculatedStep = '30' // 30 seconds
      } else if (durationInHours <= 48) {
        calculatedStep = '60' // 1 minute
      } else if (durationInDays <= 7) {
        calculatedStep = '120' // 2 minutes
      } else if (durationInDays <= 30) {
        calculatedStep = '300' // 5 minutes
      } else if (durationInDays <= 60) {
        calculatedStep = '1800' // 30 minutes
      } else {
        calculatedStep = '7200' // 2 hours
      }
    }
  }

  return useQuery({
    ...observability.observability({
      clusterId,
      query,
      queryRange,
      startTimestamp,
      endTimestamp,
      step: calculatedStep,
    }),
  })
}
