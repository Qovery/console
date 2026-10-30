import { type MetricData } from '../hooks/use-metrics/use-metrics'
import { formatTimestamp } from './format-timestamp'

type ChartDataPoint = {
  timestamp: number
  time: string
  fullTime: string
  [key: string]: string | number | null
}

const CHART_METADATA_KEYS = new Set(['timestamp', 'time', 'fullTime'])

// Generic helper function to process metrics data
export function processMetricsData(
  metricsData: { data?: { result: MetricData[] } } | undefined,
  timeSeriesMap: Map<number, ChartDataPoint>,
  getSeriesName: (series: MetricData, index: number) => string,
  transformValue: (value: string) => number,
  useLocalTime: boolean,
  invalidValue: number | null = 0
) {
  if (!metricsData?.data?.result) return

  metricsData.data.result.forEach((series: MetricData, index: number) => {
    const seriesName = getSeriesName(series, index)

    series.values.forEach(([timestamp, value]: [number, string]) => {
      const timestampNum = timestamp * 1000 // Convert to milliseconds
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
        const transformed = transformValue(value)
        dataPoint[seriesName] = isNaN(transformed) ? invalidValue : transformed
      }
    })
  })
}

export function hasMetricData(chartData: ChartDataPoint[]): boolean {
  return chartData.some((dataPoint) =>
    Object.entries(dataPoint).some(
      ([key, value]) => !CHART_METADATA_KEYS.has(key) && typeof value === 'number' && Number.isFinite(value)
    )
  )
}

export function hasPositiveMetricData(chartData: ChartDataPoint[]): boolean {
  return chartData.some((dataPoint) =>
    Object.entries(dataPoint).some(
      ([key, value]) =>
        !CHART_METADATA_KEYS.has(key) && typeof value === 'number' && Number.isFinite(value) && value > 0
    )
  )
}
